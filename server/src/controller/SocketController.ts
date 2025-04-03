import { Socket, Server } from 'socket.io'
import SocketAuthController from '../auth/SocketAuthController'
import model from '../model/model'
import WebPusherController from './WebPusherController'
import encryptionController from '../security/Encryption'
import {
    GroupMessageData,
    MessageSeenData,
    DeleteMessageData,
    EditMessageData,
    ReactToMessageData
} from '../interfaces/SocketEventInterfaces'

interface SentMessages {
    receiverId: string
    message: string
    messageType: string

    messageId: string | number
}

const handleSocketError = (socket: Socket, event: string, error: any, message: string) => {
    console.error(`${event} error:`, error)
    socket.emit(`${event}Error`, message)
}

const SocketController = (io: Server) => {
    try {
        const userSockets: Record<string, string[]> = {}

        // Handle authorization
        SocketAuthController(io)

        io.on('connection', async (socket: Socket) => {
            if (!socket.data?.user?.userId) {
                socket.disconnect()
                return
            }

            const userId: string = socket.data.user.userId
            if (!userId) {
                socket.disconnect()
                return
            }

            const user = await model.User.findById(userId).select('groups')
            if (!user) {
                socket.disconnect()
                return
            }

            const userGroups: string[] = user.groups.map(x => x.toString()) || []

            userGroups.forEach(element => socket.join(element))
            await model.User.findByIdAndUpdate(userId, { lastActiveTime: Date.now() })

            userSockets[userId] = userSockets[userId] || []
            userSockets[userId].push(socket.id)

            const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId].length > 0)
            socket.broadcast.emit('onlineUsers', onlineUsers)
            io.to(socket.id).emit('onlineUsers', onlineUsers)
            socket.broadcast.emit('onlineUsers', onlineUsers)

            const emitToUserSockets = (userId: string, event: string, data: any) => {
                if (userSockets[userId]) {
                    userSockets[userId].forEach((id) => socket.to(id).emit(event, data))
                }
            }

            // Handle initiating a video call
            socket.on('startCall', (data: { receiverId: string, offer: RTCSessionDescriptionInit, isVideoCall: boolean }) => {
                try {
                    const { receiverId, offer, isVideoCall } = data

                    if (userSockets[receiverId]) {
                        emitToUserSockets(receiverId, 'incomingCall', { callerId: userId, offer, isVideoCall: isVideoCall })
                    }
                } catch (error) {
                    handleSocketError(socket, 'startCall', error, 'Failed to initiate call')
                }
            })

            // Handle call acceptance
            socket.on('acceptCall', (data: { callerId: string, answer: RTCSessionDescriptionInit }) => {
                try {
                    const { callerId, answer } = data

                    if (userSockets[callerId]) {
                        emitToUserSockets(callerId, 'callAccepted', { callerId: userId, answer })
                    }
                } catch (error) {
                    handleSocketError(socket, 'acceptCall', error, 'Failed to accept call')
                }
            })

            socket.on('cancelCall', (data: { receiverId: string }) => {
                try {
                    const { receiverId } = data

                    if (userSockets[receiverId]) {
                        emitToUserSockets(receiverId, 'callCancelled', { callerId: receiverId })
                    }
                } catch (error) {
                    handleSocketError(socket, 'cancelCall', error, 'Failed to cancel call')
                }
            })

            socket.on('rejectCall', (data: { callerId: string }) => {
                try {
                    const { callerId } = data

                    if (userSockets[callerId]) {
                        emitToUserSockets(callerId, 'callRejected', { peerId: userId })
                    }
                } catch (error) {
                    handleSocketError(socket, 'rejectCall', error, 'Failed to reject call')
                }
            })

            socket.on('message', async (data: SentMessages) => {
                try {
                    const { receiverId, message, messageType, messageId } = data;
                    const senderData = await model.User.findById(userId).select('username publicKey') as { username: string, publicKey: string };
                    const receiverData = await model.User.findById(receiverId).select('publicKey');
                    if (!receiverData) throw new Error('Receiver not found');

                    // Hybrid encryption: AES for message, RSA for AES key
                    const encryptedData = await encryptionController.encryptMessage(receiverData.publicKey, message); // Now returns JSON string

                    const newMessage = new model.Message({
                        sender: userId,
                        receiver: receiverId,
                        message: encryptedData, // Store encrypted JSON
                        type: messageType,
                    });

                    await newMessage.save();

                    const sentMessage = {
                        ...newMessage.toObject(),
                        message, // Plaintext for sender
                        sender: userId,
                        receiver: receiverId,
                    };

                    io.to(socket.id).emit('messageSent', { messageId, sentMessage });
                    emitToUserSockets(userId, 'receiveSentMessage', sentMessage);

                    if (userSockets[receiverId]) {
                        // Receiver gets encrypted message to decrypt client-side, or decrypt server-side if preferred
                        emitToUserSockets(receiverId, 'receiveMessage', { 
                            message: { ...newMessage.toObject(), message: encryptedData }, 
                            senderUserName: senderData.username 
                        });
                        await model.Message.findByIdAndUpdate(newMessage._id, { isMessageSeen: true, isMessageReceived: true });
                        io.to(socket.id).emit('messageReceived', { messageId: newMessage._id });
                        emitToUserSockets(userId, 'messageReceived', { messageId: newMessage._id });
                    } else {
                        await model.User.findByIdAndUpdate(receiverId, { $push: { unreads: newMessage._id } });
                        await WebPusherController.sendDataToWebPush(senderData.username, data);
                    }
                } catch (error) {
                    handleSocketError(socket, 'message', error, 'Failed to send message');
                }
            });

            socket.on("groupMessage", async (data: GroupMessageData) => {
                try {
                    const { group, message, messageType, messageId, sender } = data;
                    const senderName = await model.User.findById(userId).select('username');
                    const groupData = await model.Group.findById(group).select('groupName aesKey iv');
                    if (!groupData) throw new Error('Group not found');

                    // Encrypt group message with AES
                    const encryptedMessage = encryptionController.encryptGroupMessage({
                        iv: groupData.iv,
                        privateKey: groupData.aesKey, // Using aesKey as the symmetric key
                        message,
                    });

                    const newMessage = new model.GMessage({
                        sender: userId,
                        group: group,
                        message: encryptedMessage, // Store encrypted
                        type: messageType,
                    });

                    await newMessage.save();

                    const sentMessage = {
                        ...newMessage.toObject(),
                        message, // Plaintext for sender
                        sender: sender || userId,
                        group: group,
                    };

                    socket.to(group).emit("receiveGroupMessage", { 
                        message: { ...newMessage.toObject(), message: encryptedMessage }, // Encrypted for receivers
                        groupName: groupData.groupName,
                        senderName: senderName?.username 
                    });
                } catch (error) {
                    handleSocketError(socket, 'groupMessage', error, 'Failed to send group message');
                }
            });

            socket.on('messageSeen', async (data: MessageSeenData) => {
                try {
                    const { messageId, receiverId } = data
                    await model.Message.findByIdAndUpdate(messageId, { isMessageSeen: true, isMessageReceived: true })
                    emitToUserSockets(receiverId, 'messageSeen', { messageId })
                } catch (error) {
                    handleSocketError(socket, 'messageSeen', error, 'Failed to mark message as seen')
                }
            })

            socket.on('groupMessageSeen', async (data: { messageId: string; receiverId: string, group: string }) => {
                try {
                    await model.GMessage.findByIdAndUpdate(data.messageId, { $push: { seen: { member: data.receiverId, seenAt: new Date() } } });
                    socket.to(data.group).emit('groupMessageSeen', { messageId: data.messageId });
                } catch (error) {
                    handleSocketError(socket, 'groupMessageSeen', error, 'Failed to mark group message as seen');
                }
            });

            socket.on('deleteMessage', async (data: DeleteMessageData) => {
                try {
                    const { messageId, receiverId } = data
                    await model.Message.findByIdAndDelete(messageId)
                    emitToUserSockets(receiverId, 'messageDeleted', messageId)
                } catch (error) {
                    handleSocketError(socket, 'deleteMessage', error, 'Failed to delete message')
                }
            })

            socket.on('editMessage', async (data: EditMessageData) => {
                try {
                    const { messageId, message, receiverId } = data
                    const senderUserName = await model.User.findById(userId).select('username publicKey ') as unknown as { username: string, publicKey: string }
                    const encryptedMessage = await encryptionController.encryptMessage(senderUserName.publicKey, message)
                    await model.Message.findByIdAndUpdate(messageId, { message: encryptedMessage, edited: true })
                    emitToUserSockets(receiverId, 'messageEdited', { messageId, message })
                } catch (error) {
                    handleSocketError(socket, 'editMessage', error, 'Failed to edit message')
                }
            })

            socket.on('reactToMessage', async (data: ReactToMessageData) => {
                try {
                    const { messageId, receiverId, reaction } = data
                    await model.Message.findByIdAndUpdate(messageId, { reaction })
                    emitToUserSockets(receiverId, 'messageReacted', { messageId, reaction })
                } catch (error) {
                    handleSocketError(socket, 'reactToMessage', error, 'Failed to react to message')
                }
            })

            socket.on("markMessageAsRead", async (data: string[]) => {
                try {
                    await model.User.findByIdAndUpdate(userId, { $pull: { unreads: { $in: data } } })
                } catch (error) {
                    handleSocketError(socket, 'markMessageAsRead', error, 'Failed to mark message as read')
                }
            })

            // Typing notifications
            socket.on('userTyping', ({ receiverId }: { receiverId: string }) => {
                try {
                    emitToUserSockets(receiverId, 'userTyping', { typingUserId: userId })
                } catch (error) {
                    handleSocketError(socket, 'userTyping', error, 'Failed to send typing notification')
                }
            })

            socket.on('userNotTyping', ({ receiverId }: { receiverId: string }) => {
                try {
                    emitToUserSockets(receiverId, 'userNotTyping', { typingUserId: userId })
                } catch (error) {
                    handleSocketError(socket, 'userNotTyping', error, 'Failed to send typing notification')
                }
            })

            socket.on("iceCandidate", (data: { candidate: RTCIceCandidate, receiverId: string }) => {
                try {
                    emitToUserSockets(data.receiverId, "iceCandidate", { candidate: data.candidate, receiverId: userId })
                } catch (error) {
                    handleSocketError(socket, 'iceCandidate', error, 'Failed to send ice candidate')
                }
            })

            // Disconnect handling
            socket.on('disconnect', () => {
                try {
                    if (userSockets[userId]) {
                        userSockets[userId] = userSockets[userId].filter((id) => id !== socket.id)
                        if (userSockets[userId].length === 0) {
                            delete userSockets[userId]
                        }
                    }
                    const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId].length > 0)
                    io.emit('onlineUsers', onlineUsers)
                } catch (error) {
                    handleSocketError(socket, 'disconnect', error, 'Failed to disconnect')
                }
            })
        })
    } catch (error) {
        console.error(error)
    }
}

export default SocketController
