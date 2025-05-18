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
const model_1 = __importDefault(require("../model/model"));
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverId } = req.params;
        const { userId } = res.locals.user;
        if (!userId || !receiverId) {
            res.status(200).json({ message: 'Sender and receiver are required', isError: true });
            return;
        }
        const messages = yield model_1.default.Message
            .find({
            $or: [
                { sender: userId, receiver: receiverId },
                { sender: receiverId, receiver: userId },
            ],
        })
            .sort({ createdAt: -1 });
        if (messages.length <= 0) {
            res.status(200).json({ messages: [], isError: false });
            return;
        }
        res.status(200).json({ messages: messages.reverse(), isError: false });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const getGMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { group } = req.params;
        const groupData = yield model_1.default.Group.findById(group);
        if (!groupData) {
            res.status(200).json({ message: 'Group not found', isError: true });
            return;
        }
        const messages = yield model_1.default.GMessage.find({ group })
            .populate([
            { path: 'replying' },
            { path: 'sender', select: '-privateKey -publicKey -password' }
        ])
            .sort({ createdAt: -1 });
        if (messages.length <= 0) {
            res.status(200).json({ messages: [], isError: false });
            return;
        }
        res.status(200).json({ messages, isError: false });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Reloading...' });
    }
});
exports.default = {
    getMessage,
    getGMessage,
};
