import crypto from 'crypto';
import model from '../model/model';

const AES_KEY_LENGTH = 32;
const generateKeyPair = async () => {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: process.env.KEY_PASSPHRASE as string
            }
        }, (err, publicKey, privateKey) => {
            if (err) return reject(err);
            resolve({ publicKey, privateKey });
        });
    });
}


const generateGroupKeys = () => {
    try {
        const aesKey = crypto.randomBytes(AES_KEY_LENGTH);
        const privateKey = crypto.randomBytes(32).toString('hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
        let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
        encryptedPrivateKey += cipher.final('hex');
        return { encryptedPrivateKey, aesKey, iv }
    } catch (err) { throw err }
}


const getPrivateKey = async (email: string) => {
    try {
        const user = await model.User.findOne({ email: email }).select('privateKey')
        return user?.privateKey;
    } catch (error) {
        throw error;
    }
};

export default {
    generateKeyPair,
    generateGroupKeys,
    getPrivateKey
}