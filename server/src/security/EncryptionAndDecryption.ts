import crypto from 'crypto'

const decryptPrivateKey = async (encryptedPrivateKey: string): Promise<string> => {
    try {
        const keyObject = crypto.createPrivateKey({
            key: encryptedPrivateKey,
            format: 'pem',
            passphrase: process.env.KEY_PASSPHRASE
        });
        return keyObject.export({ type: 'pkcs1', format: 'pem' }) as string
    } catch (err) {
        console.error('Error decrypting private key:', err);
        throw err;
    }
};

const decryptGroupMessage = (data: { iv: string, privateKey: string, message: string }) => {
    try {
        if (!data) return
        const ivBuffer = Buffer.from(data.iv, 'hex')
        const aesKeyBuffer = Buffer.from(data.privateKey, 'hex')
        const encryptedMessage = Buffer.from(data.message, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer)
        let decryptedMessage = decipher.update(encryptedMessage, undefined, 'utf-8')
        decryptedMessage += decipher.final('utf-8')
        return decryptedMessage
    } catch (err) { console.error(err) }
}

const decryptGroupPrivateKey = (data: { aesKey: string, iv: string, encryptedPrivateKey: string }) => {
    const ivBuffer = Buffer.from(data.iv, 'hex')
    const aesKeyBuffer = Buffer.from(data.aesKey, 'hex')
    const encryptedPrivateKeyBuffer = Buffer.from(data.encryptedPrivateKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer)
    let decryptedPrivateKey = decipher.update(encryptedPrivateKeyBuffer, undefined, 'utf8')
    decryptedPrivateKey += decipher.final('utf-8')
    return decryptedPrivateKey
}

const decryptMessage = async (privateKey: string, encryptedMessage: string) => {
    try {
        return crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
            },
            Buffer.from(encryptedMessage, 'base64')
        ).toString('utf-8');
    } catch (err) {
        console.error('Error decrypting message:', err);
        throw err;
    }
};

export default {
    decryptPrivateKey,
    decryptGroupMessage,
    decryptGroupPrivateKey,
    decryptMessage
}