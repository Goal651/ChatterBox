import crypto from 'crypto';

const encryptPrivateKey = async (privateKey: string): Promise<string> => {
    try {
        return crypto.publicEncrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
            },
            Buffer.from(privateKey, 'utf-8')
        ).toString('base64');
    } catch (err) {
        console.error('Error encrypting private key:', err);
        throw err;
    }
};

const encryptMessage = async (publicKey: string, message: string): Promise<string> => {
    try {
        return crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
            },
            Buffer.from(message, 'utf-8')
        ).toString('base64');
    } catch (err) {
        console.error('Error encrypting message:', err);
        throw err;
    }
};

const encryptGroupMessage = (data: { iv: string, privateKey: string, message: string }): string => {
    try {
        const ivBuffer = Buffer.from(data.iv, 'hex');
        const aesKeyBuffer = Buffer.from(data.privateKey, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer);
        let encryptedMessage = cipher.update(data.message, 'utf-8', 'hex');
        encryptedMessage += cipher.final('hex');
        return encryptedMessage;
    } catch (err) {
        console.error('Error encrypting group message:', err);
        throw err;
    }
};

const encryptGroupPrivateKey = (data: { aesKey: string, iv: string, privateKey: string }): string => {
    try {
        const ivBuffer = Buffer.from(data.iv, 'hex');
        const aesKeyBuffer = Buffer.from(data.aesKey, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer);
        let encryptedPrivateKey = cipher.update(data.privateKey, 'utf-8', 'hex');
        encryptedPrivateKey += cipher.final('hex');
        return encryptedPrivateKey;
    } catch (err) {
        console.error('Error encrypting group private key:', err);
        throw err;
    }
};

export default {
    encryptPrivateKey,
    encryptMessage,
    encryptGroupMessage,
    encryptGroupPrivateKey
};
