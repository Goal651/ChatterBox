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
const crypto_1 = __importDefault(require("crypto"));
const encryptPrivateKey = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return crypto_1.default.publicEncrypt({
            key: privateKey,
            padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING
        }, Buffer.from(privateKey, 'utf-8')).toString('base64');
    }
    catch (err) {
        console.error('Error encrypting private key:', err);
        throw err;
    }
});
const encryptMessage = (publicKey, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return crypto_1.default.publicEncrypt({
            key: publicKey,
            padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING
        }, Buffer.from(message, 'utf-8')).toString('base64');
    }
    catch (err) {
        console.error('Error encrypting message:', err);
        throw err;
    }
});
const encryptGroupMessage = (data) => {
    try {
        const ivBuffer = Buffer.from(data.iv, 'hex');
        const aesKeyBuffer = Buffer.from(data.privateKey, 'hex');
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer);
        let encryptedMessage = cipher.update(data.message, 'utf-8', 'hex');
        encryptedMessage += cipher.final('hex');
        return encryptedMessage;
    }
    catch (err) {
        console.error('Error encrypting group message:', err);
        throw err;
    }
};
const encryptGroupPrivateKey = (data) => {
    try {
        const ivBuffer = Buffer.from(data.iv, 'hex');
        const aesKeyBuffer = Buffer.from(data.aesKey, 'hex');
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer);
        let encryptedPrivateKey = cipher.update(data.privateKey, 'utf-8', 'hex');
        encryptedPrivateKey += cipher.final('hex');
        return encryptedPrivateKey;
    }
    catch (err) {
        console.error('Error encrypting group private key:', err);
        throw err;
    }
};
exports.default = {
    encryptPrivateKey,
    encryptMessage,
    encryptGroupMessage,
    encryptGroupPrivateKey
};
