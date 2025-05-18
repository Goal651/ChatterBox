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
const AES_KEY_LENGTH = 32;
const generateKeyPair = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        crypto_1.default.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: process.env.KEY_PASSPHRASE
            }
        }, (err, publicKey, privateKey) => {
            if (err)
                return reject(err);
            resolve({ publicKey, privateKey });
        });
    });
});
const generateGroupKeys = () => {
    try {
        const aesKey = crypto_1.default.randomBytes(AES_KEY_LENGTH);
        const privateKey = crypto_1.default.randomBytes(32).toString('hex');
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', aesKey, iv);
        let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
        encryptedPrivateKey += cipher.final('hex');
        return { encryptedPrivateKey, aesKey, iv };
    }
    catch (err) {
        throw err;
    }
};
const getPrivateKey = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.User.findOne({ email: email }).select('privateKey');
        return user === null || user === void 0 ? void 0 : user.privateKey;
    }
    catch (error) {
        throw error;
    }
});
exports.default = {
    generateKeyPair,
    generateGroupKeys,
    getPrivateKey
};
