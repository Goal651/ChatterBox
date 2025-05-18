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
const model_1 = __importDefault(require("../model/model"));
const getPrivateKey = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.User.findById(id).select('privateKey');
        return user === null || user === void 0 ? void 0 : user.privateKey;
    }
    catch (err) {
        console.error('Error reading private key from config:', err);
        throw err;
    }
});
const decryptPrivateKey = (encryptedPrivateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyObject = crypto_1.default.createPrivateKey({
            key: encryptedPrivateKey,
            format: 'pem',
            passphrase: process.env.KEY_PASSPHRASE
        });
        return keyObject.export({ type: 'pkcs1', format: 'pem' });
    }
    catch (err) {
        console.error('Error decrypting private key:', err);
        throw err;
    }
});
const decryptGroupMessage = (data) => {
    try {
        if (!data)
            return;
        const ivBuffer = Buffer.from(data.iv, 'hex');
        const aesKeyBuffer = Buffer.from(data.privateKey, 'hex');
        const encryptedMessage = Buffer.from(data.message, 'hex');
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer);
        let decryptedMessage = decipher.update(encryptedMessage, undefined, 'utf-8');
        decryptedMessage += decipher.final('utf-8');
        return decryptedMessage;
    }
    catch (err) {
        console.error(err);
    }
};
const decryptGroupPrivateKey = (data) => {
    const ivBuffer = Buffer.from(data.iv, 'hex');
    const aesKeyBuffer = Buffer.from(data.aesKey, 'hex');
    const encryptedPrivateKeyBuffer = Buffer.from(data.encryptedPrivateKey, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer);
    let decryptedPrivateKey = decipher.update(encryptedPrivateKeyBuffer, undefined, 'utf8');
    decryptedPrivateKey += decipher.final('utf-8');
    return decryptedPrivateKey;
};
const decryptMessage = (senderId, encryptedMessage) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const encryptedPrivateKey = yield getPrivateKey(senderId);
        if (!encryptedPrivateKey)
            throw new Error('Private key not found');
        const privateKey = yield decryptPrivateKey(encryptedPrivateKey);
        if (!privateKey)
            throw new Error('Private key not found');
        return crypto_1.default.privateDecrypt({
            key: privateKey,
            padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING
        }, Buffer.from(encryptedMessage, 'base64')).toString('utf-8');
    }
    catch (err) {
        console.error('Error decrypting message:', err);
        throw err;
    }
});
exports.default = {
    decryptPrivateKey,
    decryptGroupMessage,
    decryptGroupPrivateKey,
    decryptMessage
};
