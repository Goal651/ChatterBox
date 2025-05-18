"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SocketAuthController_1 = __importDefault(require("../auth/SocketAuthController"));
const model_1 = __importDefault(require("../model/model"));
const Encryption_1 = __importDefault(require("../security/Encryption"));
const SocketController = (io) => {
    try {
        const userSockets = new Map();
        // Handle authorization
        (0, SocketAuthController_1.default)(io);
        const emitToUserSockets = (userId, event, data) => {
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.forEach(socketId => io.to(socketId).emit(event, data));
            }
        };
        io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!((_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId)) {
                socket.disconnect();
                return;
            }
            const userId = socket.data.user.userId;
            if (!userId) {
                socket.disconnect();
                return;
            }
            const user = yield model_1.default.User.findById(userId).select('groups');
            if (!user) {
                socket.disconnect();
                return;
            }
            const userGroups = user.groups.map(x => x.toString()) || [];
            userGroups.forEach(element => socket.join(element));
            yield model_1.default.User.findByIdAndUpdate(userId, { lastActiveTime: Date.now() });
            // Add the user's socket to the map
            if (!userSockets.has(userId))
                userSockets.set(userId, new Set());
            (_c = userSockets.get(userId)) === null || _c === void 0 ? void 0 : _c.add(socket.id);
            const onlineUsers = Array.from(userSockets.keys());
            socket.broadcast.emit('onlineUsers', onlineUsers);
            emitToUserSockets(userId, 'onlineUsers', onlineUsers);
            socket.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // const encryptedMessage = await encryptionController.encryptMessage(senderUserName.publicKey, message)
                    const newMessage = new model_1.default.Message({
                        sender: userId,
                        receiver: data.receiver,
                        message: data.message,
                        type: data.type,
                    });
                    yield newMessage.save();
                    const sentMessage = Object.assign({}, newMessage.toObject());
                    emitToUserSockets(userId, 'messageSent', sentMessage);
                    // if (userSockets.has(receiverId)) {
                    emitToUserSockets(sentMessage.receiver._id.toString(), 'receiveMessage', sentMessage);
                    //     await model.Message.findByIdAndUpdate(newMessage._id, { isMessageSeen: true, isMessageReceived: true })
                    //     io.to(socket.id).emit('messageReceived', { messageId: newMessage._id })
                    //     emitToUserSockets(userId, 'messageReceived', { messageId: newMessage._id })
                    // } else {
                    //     await model.User.findByIdAndUpdate(receiverId, { $push: { unreads: newMessage._id } })
                    //     await WebPusherController.sendDataToWebPush(senderUserName.username, data)
                    // }
                }
                catch (error) {
                    console.error(error);
                    socket.emit('messageError', 'Failed to send message');
                }
            }));
            socket.on("groupMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const { group, message, messageType, messageId, sender } = data;
                    const senderName = yield model_1.default.User.findById(userId);
                    const groupName = yield model_1.default.Group.findById(group).select('groupName');
                    const newMessage = new model_1.default.GMessage({
                        sender: userId,
                        group: group,
                        message: message,
                        type: messageType,
                    });
                    yield newMessage.save();
                    const sentMessage = Object.assign(Object.assign({}, newMessage.toObject()), { message, sender: sender, group: group });
                    socket.to(group).emit("receiveGroupMessage", { message: sentMessage, groupName: groupName === null || groupName === void 0 ? void 0 : groupName.groupName, senderName: senderName === null || senderName === void 0 ? void 0 : senderName.username });
                }
                catch (error) {
                    console.error(error);
                    socket.emit('messageError', 'Failed to send message');
                }
            }));
            socket.on('messageSeen', (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const { messageId, receiverId } = data;
                    yield model_1.default.Message.findByIdAndUpdate(messageId, { isMessageSeen: true, isMessageReceived: true });
                    emitToUserSockets(receiverId, 'messageSeen', { messageId });
                }
                catch (error) {
                    console.error(error);
                    socket.emit('messageError', 'Failed to mark message as seen');
                }
            }));
            socket.on('deleteMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const { messageId, receiverId } = data;
                    yield model_1.default.Message.findByIdAndDelete(messageId);
                    emitToUserSockets(receiverId, 'messageDeleted', messageId);
                }
                catch (error) {
                    console.error(error);
                    socket.emit('messageError', 'Failed to delete message');
                }
            }));
            socket.on('editMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const { messageId, message, receiverId } = data;
                    const senderUserName = yield model_1.default.User.findById(userId).select('username publicKey');
                    const encryptedMessage = yield Encryption_1.default.encryptMessage(senderUserName.publicKey, message);
                    yield model_1.default.Message.findByIdAndUpdate(messageId, { message: encryptedMessage, edited: true });
                    emitToUserSockets(receiverId, 'messageEdited', { messageId, message });
                }
                catch (error) {
                    console.error(error);
                    socket.emit('messageError', 'Failed to edit message');
                }
            }));
            socket.on('reactToMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const { messageId, receiverId, reaction } = data;
                    yield model_1.default.Message.findByIdAndUpdate(messageId, { reaction });
                    emitToUserSockets(receiverId, 'messageReacted', { messageId, reaction });
                }
                catch (error) {
                    console.error(error);
                    socket.emit('messageError', 'Failed to react to message');
                }
            }));
            socket.on("markMessageAsRead", (data) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield model_1.default.User.findByIdAndUpdate(userId, { $pull: { unreads: { $in: data } } });
                }
                catch (error) {
                    socket.emit("markMessageAsReadError", "Failed to mark messages as read");
                }
            }));
            // Typing notifications
            socket.on('userTyping', ({ receiverId }) => {
                try {
                    emitToUserSockets(receiverId, 'userTyping', { typingUserId: userId });
                }
                catch (error) {
                    console.error(error);
                    socket.emit('typingError', 'Failed to send typing notification');
                }
            });
            socket.on('userNotTyping', ({ receiverId }) => {
                try {
                    emitToUserSockets(receiverId, 'userNotTyping', { typingUserId: userId });
                }
                catch (error) {
                    console.error(error);
                    socket.emit('typingError', 'Failed to send not typing notification');
                }
            });
            // Disconnect handling
            socket.on('disconnect', () => {
                var _a, _b;
                try {
                    if (userSockets.has(userId)) {
                        (_a = userSockets.get(userId)) === null || _a === void 0 ? void 0 : _a.delete(socket.id);
                        if (((_b = userSockets.get(userId)) === null || _b === void 0 ? void 0 : _b.size) === 0)
                            userSockets.delete(userId);
                    }
                    const onlineUsers = Array.from(userSockets.keys());
                    io.emit('onlineUsers', onlineUsers);
                }
                catch (error) {
                    console.error(error);
                }
            });
        }));
    }
    catch (error) {
        console.error(error);
    }
};
exports.default = SocketController;
