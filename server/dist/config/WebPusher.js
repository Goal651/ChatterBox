"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_push_1 = __importDefault(require("web-push"));
const privateKey = process.env.PRIVATE_KEY || '';
const publicKey = process.env.PUBLIC_KEY || '';
if (!privateKey || !publicKey) {
    throw new Error('VAPID keys are missing. Please set PRIVATE_KEY and PUBLIC_KEY in your environment variables.');
}
web_push_1.default.setVapidDetails('mailto:wigothehacker@gmail.com', publicKey, privateKey);
exports.default = web_push_1.default;
