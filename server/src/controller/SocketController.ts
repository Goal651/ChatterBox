import { Socket, Server } from 'socket.io'
import SocketAuthController from '../auth/SocketAuthController'
import model from '../model/model'
import WebPusherController from './WebPusherController'
import encryptionController from '../security/Encryption'
import { models } from 'mongoose'

interface SentMessages {
    receiverId: string
    message: string
    messageType: string
    messageId: string | number
}

const SocketController = (io: Server) => {
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

        const user = await models.User.findById(userId).select('groups')

        const userGroups: string[] = user.groups || []

        userGroups.forEach(element => {
            socket.join(element.toString())
        })
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
            const { receiverId, offer, isVideoCall } = data


            if (userSockets[receiverId]) {
                emitToUserSockets(receiverId, 'incomingCall', { callerId: userId, offer, isVideoCall: isVideoCall })
            } else {
                console.log(`User ${receiverId} is not online.`)
            }
        })

        // Handle call acceptance
        socket.on('acceptCall', (data: { callerId: string, answer: RTCSessionDescriptionInit }) => {
            const { callerId, answer } = data

            if (userSockets[callerId]) {
                emitToUserSockets(callerId, 'callAccepted', { callerId: userId, answer })
            }
        })

        socket.on('cancelCall', (data: { receiverId: string }) => {
            const { receiverId } = data

            if (userSockets[receiverId]) {
                emitToUserSockets(receiverId, 'callCancelled', { callerId: receiverId })
            }
        })

        socket.on('rejectCall', (data: { callerId: string }) => {
            const { callerId } = data

            if (userSockets[callerId]) {
                emitToUserSockets(callerId, 'callRejected', { peerId: userId })
            }
        })



        socket.on('message', async (data: SentMessages) => {
            try {
                const { receiverId, message, messageType, messageId } = data
                const senderUserName = await model.User.findById(userId).select('username publicKey ') as unknown as { username: string, publicKey: string }
                console.log(senderUserName)
                const encryptedMessage = await encryptionController.encryptMessage(senderUserName.publicKey, message)

                const newMessage = new model.Message({
                    sender: userId,
                    receiver: receiverId,
                    message: encryptedMessage,
                    type: messageType,
                })

                await newMessage.save()

                const sentMessage = {
                    ...newMessage.toObject(),
                    message,
                    sender: userId,
                    receiver: receiverId,
                }
                io.to(socket.id).emit('messageSent', { messageId, sentMessage })
                emitToUserSockets(userId, 'receiveSentMessage', sentMessage)

                if (userSockets[receiverId]) {
                    emitToUserSockets(receiverId, 'receiveMessage', { message: sentMessage, senderUserName: senderUserName.username })
                    await model.Message.findByIdAndUpdate(newMessage._id, { isMessageSeen: true, isMessageReceived: true })
                    io.to(socket.id).emit('messageReceived', { messageId: newMessage._id })
                    emitToUserSockets(userId, 'messageReceived', { messageId: newMessage._id })
                } else {
                    await model.User.findByIdAndUpdate(receiverId, { $push: { unreads: newMessage._id } })
                    await WebPusherController.sendDataToWebPush(senderUserName.username, data)
                }
            }
            catch (error) {
                console.error(error)
                socket.emit('messageError', 'Failed to send message')
            }
        })

        socket.on("groupMessage", async (data) => {
            try {
                const { group, message, messageType, messageId, sender } = data
                const senderName = await models.User.findById(userId)
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
            }
            catch (error) {
                console.error(error)
                socket.emit('messageError', 'Failed to send message')
            }
        })

        socket.on('messageSeen', async (data: { messageId: string, receiverId: string }) => {
            const { messageId, receiverId } = data
            await model.Message.findByIdAndUpdate(messageId, { isMessageSeen: true, isMessageReceived: true })
            emitToUserSockets(receiverId, 'messageSeen', { messageId })
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
            emitToUserSockets(receiverId, 'userTyping', { typingUserId: userId })
        })

        socket.on('userNotTyping', ({ receiverId }: { receiverId: string }) => {
            emitToUserSockets(receiverId, 'userNotTyping', { typingUserId: userId })
        })

        socket.on("iceCandidate", (data: { candidate: RTCIceCandidate, receiverId: string }) => {
            try {
                emitToUserSockets(data.receiverId, "iceCandidate", { candidate: data.candidate, receiverId: userId })
            } catch (error) {
                console.error(error)
            }
        })

        // Disconnect handling
        socket.on('disconnect', () => {
            if (userSockets[userId]) {
                userSockets[userId] = userSockets[userId].filter((id) => id !== socket.id)
                if (userSockets[userId].length === 0) {
                    delete userSockets[userId]
                }
            }
            const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId].length > 0)
            io.emit('onlineUsers', onlineUsers)
        })
    })
}

export default SocketController
