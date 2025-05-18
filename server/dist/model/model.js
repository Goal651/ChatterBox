"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, default: '' },
    username: { type: String, required: true },
    lastActiveTime: { type: Date, default: Date.now },
    groups: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Group',
            default: []
        }],
    unreads: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Message',
            default: []
        }],
    isVerified: { type: Boolean, default: false },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const groupSchema = new mongoose_1.default.Schema({
    groupName: { type: String, required: true },
    image: { type: String, default: '' },
    members: [{
            member: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: { type: String, default: '' }
        }],
    description: { type: String, default: '' },
    aesKey: { type: String, required: true },
    iv: { type: String, required: true },
    encryptedPrivateKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, }
});
const tokenSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    accessToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { type: String, required: true, },
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isMessageSeen: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    isMessageSent: { type: Boolean, default: true },
    isMessageReceived: { type: Boolean, default: false },
    reactions: [{
            reaction: { type: String, required: true },
            reactor: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            default: []
        }],
    replying: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const groupMessageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { type: String, required: true, },
    group: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    seen: [{
            member: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            seenAt: { type: Date, default: Date.now },
            default: []
        }],
    replying: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'GMessage',
        default: null
    },
    isMessageSent: { type: Boolean, default: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const subscriptionSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, unique: true },
    subscription: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now }
});
const notificationSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    details: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});
const Subscription = mongoose_1.default.model("Subscription", subscriptionSchema);
const User = mongoose_1.default.model("User", userSchema);
const Tokens = mongoose_1.default.model("Token", tokenSchema);
const Message = mongoose_1.default.model("Message", messageSchema);
const Group = mongoose_1.default.model("Group", groupSchema);
const GMessage = mongoose_1.default.model('GMessage', groupMessageSchema);
const Notification = mongoose_1.default.model('Notification', notificationSchema);
exports.default = {
    User,
    Tokens,
    Message,
    Group,
    GMessage,
    Subscription,
    Notification
};
