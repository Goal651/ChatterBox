import { Socket, Server } from 'socket.io'
import SocketAuthController from '@/auth/SocketAuthController'
import model from '@/model/model'
import WebPusherController from '@/controller/WebPusherController'
import encryptionController from '@/security/Encryption'
import {
    GroupMessageData,
    MessageSeenData,
    DeleteMessageData,
    EditMessageData,
    ReactToMessageData
} from '@/interfaces/SocketEventInterfaces'
import { Message } from '@/interfaces/interface'


const SocketController = (io: Server) => {
    try {
        const userSockets = new Map<string, Set<string>>()

        // Handle authorization
        SocketAuthController(io)

        const emitToUserSockets = (userId: string, event: string, data: unknown) => {
            const sockets = userSockets.get(userId)
            console.log(sockets)
            if (sockets) {
                sockets.forEach(socketId => io.to(socketId).emit(event, data))
            }
        }

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

            // Add the user's socket to the map
            if (!userSockets.has(userId)) userSockets.set(userId, new Set())
            userSockets.get(userId)?.add(socket.id)


            const onlineUsers = Array.from(userSockets.keys())
            socket.broadcast.emit('onlineUsers', onlineUsers)
            io.to(socket.id).emit('onlineUsers', onlineUsers)

            socket.on('message', async (data: Message) => {
                try {
                    // const encryptedMessage = await encryptionController.encryptMessage(senderUserName.publicKey, message)

                    const newMessage = new model.Message({
                        sender: userId,
                        receiver: data.receiver,
                        message: data.message,
                        type: data.type,
                    })

                    await newMessage.save()

                    const sentMessage = {
                        ...newMessage.toObject(),
                    }

                    emitToUserSockets(userId, 'messageSent', sentMessage)

                    // if (userSockets.has(receiverId)) {
                    emitToUserSockets(sentMessage.receiver._id.toString(), 'receiveMessage', sentMessage)
                    //     await model.Message.findByIdAndUpdate(newMessage._id, { isMessageSeen: true, isMessageReceived: true })
                    //     io.to(socket.id).emit('messageReceived', { messageId: newMessage._id })
                    //     emitToUserSockets(userId, 'messageReceived', { messageId: newMessage._id })
                    // } else {
                    //     await model.User.findByIdAndUpdate(receiverId, { $push: { unreads: newMessage._id } })
                    //     await WebPusherController.sendDataToWebPush(senderUserName.username, data)
                    // }
                } catch (error) {
                    console.error(error)
                    socket.emit('messageError', 'Failed to send message')
                }
            })

            socket.on("groupMessage", async (data: GroupMessageData) => {
                try {
                    const { group, message, messageType, messageId, sender } = data
                    const senderName = await model.User.findById(userId)
                    const groupName = await model.Group.findById(group).select('groupName')

                    const newMessage = new model.GMessage({
                        sender: userId,
                        group: group,
                        message: message,
                        type: messageType,
                    })

                    await newMessage.save()

                    const sentMessage = {
                        ...newMessage.toObject(),
                        message,
                        sender: sender,
                        group: group,
                    }

                    socket.to(group).emit("receiveGroupMessage", { message: sentMessage, groupName: groupName?.groupName, senderName: senderName?.username })
                } catch (error) {
                    console.error(error)
                    socket.emit('messageError', 'Failed to send message')
                }
            })

            socket.on('messageSeen', async (data: MessageSeenData) => {
                try {
                    const { messageId, receiverId } = data
                    await model.Message.findByIdAndUpdate(messageId, { isMessageSeen: true, isMessageReceived: true })
                    emitToUserSockets(receiverId, 'messageSeen', { messageId })
                } catch (error) {
                    console.error(error)
                    socket.emit('messageError', 'Failed to mark message as seen')
                }
            })

            socket.on('deleteMessage', async (data: DeleteMessageData) => {
                try {
                    const { messageId, receiverId } = data
                    await model.Message.findByIdAndDelete(messageId)
                    emitToUserSockets(receiverId, 'messageDeleted', messageId)
                } catch (error) {
                    console.error(error)
                    socket.emit('messageError', 'Failed to delete message')
                }
            })

            socket.on('editMessage', async (data: EditMessageData) => {
                try {
                    const { messageId, message, receiverId } = data
                    const senderUserName = await model.User.findById(userId).select('username publicKey') as unknown as { username: string, publicKey: string }
                    const encryptedMessage = await encryptionController.encryptMessage(senderUserName.publicKey, message)
                    await model.Message.findByIdAndUpdate(messageId, { message: encryptedMessage, edited: true })
                    emitToUserSockets(receiverId, 'messageEdited', { messageId, message })
                } catch (error) {
                    console.error(error)
                    socket.emit('messageError', 'Failed to edit message')
                }
            })

            socket.on('reactToMessage', async (data: ReactToMessageData) => {
                try {
                    const { messageId, receiverId, reaction } = data
                    await model.Message.findByIdAndUpdate(messageId, { reaction })
                    emitToUserSockets(receiverId, 'messageReacted', { messageId, reaction })
                } catch (error) {
                    console.error(error)
                    socket.emit('messageError', 'Failed to react to message')
                }
            })

            socket.on("markMessageAsRead", async (data: string[]) => {
                try {
                    await model.User.findByIdAndUpdate(userId, { $pull: { unreads: { $in: data } } })
                } catch (error) {
                    socket.emit("markMessageAsReadError", "Failed to mark messages as read")
                }
            })

            // Typing notifications
            socket.on('userTyping', ({ receiverId }: { receiverId: string }) => {
                try {
                    emitToUserSockets(receiverId, 'userTyping', { typingUserId: userId })
                } catch (error) {
                    console.error(error)
                    socket.emit('typingError', 'Failed to send typing notification')
                }
            })

            socket.on('userNotTyping', ({ receiverId }: { receiverId: string }) => {
                try {
                    emitToUserSockets(receiverId, 'userNotTyping', { typingUserId: userId })
                } catch (error) {
                    console.error(error)
                    socket.emit('typingError', 'Failed to send not typing notification')
                }
            })

            // Disconnect handling
            socket.on('disconnect', () => {
                try {
                    if (userSockets.has(userId)) {
                        userSockets.get(userId)?.delete(socket.id)
                        if (userSockets.get(userId)?.size === 0) userSockets.delete(userId)
                    }
                    const onlineUsers = Array.from(userSockets.keys())
                    io.emit('onlineUsers', onlineUsers)
                } catch (error) {
                    console.error(error)
                }
            })
        })
    } catch (error) {
        console.error(error)
    }
}

export default SocketController
