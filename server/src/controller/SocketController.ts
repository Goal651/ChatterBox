import { Socket, Server } from 'socket.io';
import SocketAuthController from '../auth/SocketAuthController';
import model from '../model/model';

interface SentMessages {
    receiverId: string;
    message: string;
    messageType: string;
    messageId: string | number;
}

const SocketController = (io: Server) => {
    const userSockets: Record<string, string[]> = {};

    // Handle authorization
    SocketAuthController(io);

    io.on('connection', async (socket: Socket) => {
        if (!socket.data?.user?.userId) {
            socket.disconnect();
            return;
        }

        const userId = socket.data.user.userId;

        await model.User.findByIdAndUpdate(userId, { lastActiveTime: Date.now() })

        // Register user's socket
        userSockets[userId] = userSockets[userId] || [];
        userSockets[userId].push(socket.id);

        const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId])

        io.emit('onlineUsers', onlineUsers)


        // Helper to emit a message to all sockets of a user
        const emitToUserSockets = (userId: string, event: string, data: any) => {
            if (userSockets[userId]) {
                userSockets[userId].forEach((id) => socket.to(id).emit(event, data));
            }
        };

        // Handle message sending
        socket.on('message', async (data: SentMessages) => {
            const { receiverId, message, messageType, messageId } = data;

            const newMessage = new model.Message({
                message,
                receiver: receiverId,
                sender: userId,
                type: messageType,
            });

            const sentMessage = {
                ...newMessage.toObject(),
                sender: newMessage.sender.toString(),
                receiver: newMessage.receiver.toString(),
            };

            try {
                await newMessage.save();
                await model.User.findByIdAndUpdate(receiverId, { latestMessage: newMessage._id });
                await model.User.findByIdAndUpdate(userId, { latestMessage: newMessage._id });

                // Notify sender
                io.to(socket.id).emit('messageSent', { messageId, sentMessage });
                emitToUserSockets(userId, 'receiveMessage', sentMessage);

                // Notify receiver
                if (userSockets[receiverId]) {
                    emitToUserSockets(receiverId, 'receiveMessage', sentMessage);
                    await model.Message.findByIdAndUpdate(newMessage._id, { isMessageReceived: true });

                    //notify that message received
                    io.to(socket.id).emit('messageReceived', { messageId: sentMessage._id });
                    emitToUserSockets(userId, 'messageReceived', { messageId: sentMessage._id });

                } else {
                    await model.User.findByIdAndUpdate(receiverId, { $addToSet: { unreads: newMessage._id } });
                }
            } catch (error) {
                console.error(error);
            }
        });

        // Handle message seen
        socket.on('messageSeen', async (data: { messageId: string, receiverId: string }) => {
            if (!data) return;
            console.log(data)
            try {
                await model.Message.findByIdAndUpdate(data.messageId, { isMessageSeen: true, isMessageReceived: true });
                await model.User.findByIdAndUpdate(userId, { $unset: { unreads: data.messageId } });

                emitToUserSockets(data.receiverId, "messageSeen", { messageId: data.messageId })
                emitToUserSockets(userId, "messageSeen", { messageId: data.messageId })
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('userTyping', (data: { receiverId: string }) => {
            if (userSockets[data.receiverId]) {
                emitToUserSockets(data.receiverId, "userTyping", { typingUserId: userId })
            }
        })

        socket.on('userNotTyping', (data: { receiverId: string }) => {
            if (userSockets[data.receiverId]) {
                emitToUserSockets(data.receiverId, "userNotTyping", { typingUserId: userId })
            }
        })

        // Handle disconnect
        socket.on('disconnect', () => {
            if (userSockets[userId]) {
                userSockets[userId] = userSockets[userId].filter((id) => id !== socket.id);
                if (userSockets[userId].length === 0) {
                    delete userSockets[userId];
                }
            }

            const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId])

            io.emit('onlineUsers', onlineUsers)
        });
    });
};

export default SocketController;
