import { Socket, Server } from 'socket.io';
import SocketAuthController from '../auth/SocketAuthController';
import model from '../model/model';
import { Message } from '../interface/interface';
import WebPusherController from './WebPusherController';

interface SentMessages {
    receiverId: string;
    message: string;
    messageType: string;
    messageId: string | number;
}

interface SignalData {
    type: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    peerId: string;
    target: string;
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

        const userId: string = socket.data.user.userId;

        await model.User.findByIdAndUpdate(userId, { lastActiveTime: Date.now() });

        userSockets[userId] = userSockets[userId] || [];
        userSockets[userId].push(socket.id);

        const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId].length > 0);
        io.emit('onlineUsers', onlineUsers);

        const emitToUserSockets = (userId: string, event: string, data: any) => {
            if (userSockets[userId]) {
                userSockets[userId].forEach((id) => socket.to(id).emit(event, data));
            }
        };


        socket.on('signal', (data: SignalData) => {
            const { target, ...signalData } = data;

            if (userSockets[target]) {
                emitToUserSockets(target, 'signal', { ...signalData, peerId: userId });
            } else {
                console.log(`User ${target} is not online.`);
            }
        });

        // Handle initiating a video call
        socket.on('startCall', (data: { receiverId: string }) => {
            const { receiverId } = data;

            if (userSockets[receiverId]) {
                emitToUserSockets(receiverId, 'incomingCall', { callerId: userId });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        // Handle call acceptance
        socket.on('acceptCall', (data: { callerId: string, signal: SignalData }) => {
            const { callerId, signal } = data;

            if (userSockets[callerId]) {
                emitToUserSockets(callerId, 'callAccepted', { callerId: userId, signal });
            }
        });

        // Handle call rejection
        socket.on('rejectCall', (data: { callerId: string }) => {
            const { callerId } = data;

            if (userSockets[callerId]) {
                emitToUserSockets(callerId, 'callRejected', { peerId: userId });
            }
            // Redirect the user to the chat page
            io.to(socket.id).emit('navigateToChat', { path: `/chat/${callerId}` });
        });

        // Message handling
        socket.on('message', async (data: SentMessages) => {
            try {
                const { receiverId, message, messageType, messageId } = data;

                const newMessage = new model.Message({
                    sender: userId,
                    receiver: receiverId,
                    message,
                    type: messageType,
                });

                await newMessage.save();

                const sentMessage = {
                    ...newMessage.toObject(),
                    sender: userId,
                    receiver: receiverId,
                };
                io.to(socket.id).emit('messageSent', { messageId, sentMessage });
                emitToUserSockets(userId, 'receiveSentMessage', sentMessage);

                if (userSockets[receiverId]) {
                    emitToUserSockets(receiverId, 'receiveMessage', sentMessage);
                    await model.Message.findByIdAndUpdate(newMessage._id, { isMessageSeen: true, isMessageReceived: true });
                    io.to(socket.id).emit('messageReceived', { messageId: newMessage._id });
                    emitToUserSockets(userId, 'messageReceived', { messageId: newMessage._id });
                } else {
                    await model.User.findByIdAndUpdate(receiverId, { $push: { unreads: newMessage._id } });
                    await WebPusherController.sendDataToWebPush(receiverId, data);
                }
            }
            catch (error) {
                console.error(error);
                socket.emit('messageError', 'Failed to send message');
            }
        });

        socket.on('messageSeen', async (data: { messageId: string, receiverId: string }) => {
            const { messageId, receiverId } = data;

            await model.Message.findByIdAndUpdate(messageId, { isMessageSeen: true, isMessageReceived: true });
            emitToUserSockets(receiverId, 'messageSeen', { messageId });
        });




        socket.on("markMessageAsRead", async (data: string[]) => {
            try {
                await model.User.findByIdAndUpdate(userId, { $pull: { unreads: { $in: data } } });
            } catch (error) {
                socket.emit("markMessageAsReadError", "Failed to mark messages as read");
            }
        });


        // Typing notifications
        socket.on('userTyping', ({ receiverId }: { receiverId: string }) => {
            emitToUserSockets(receiverId, 'userTyping', { userId });
        });

        socket.on('userNotTyping', ({ receiverId }: { receiverId: string }) => {
            emitToUserSockets(receiverId, 'userNotTyping', { userId });
        });

        // Disconnect handling
        socket.on('disconnect', () => {
            if (userSockets[userId]) {
                userSockets[userId] = userSockets[userId].filter((id) => id !== socket.id);
                if (userSockets[userId].length === 0) {
                    delete userSockets[userId];
                }
            }
            const onlineUsers = Object.keys(userSockets).filter(userId => userSockets[userId].length > 0);
            io.emit('onlineUsers', onlineUsers);
        });
    });
};

export default SocketController;
