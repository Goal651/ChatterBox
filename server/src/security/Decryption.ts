import crypto from 'crypto'
import model from '@/model/model'

const getPrivateKey = async (id: string): Promise<string | undefined> => {
    try {
        const user = await model.User.findById(id).select('privateKey')
        return user?.privateKey
    } catch (err) {
        console.error('Error reading private key from config:', err)
        throw err
    }
}


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

const decryptMessage = async (senderId: string, encryptedMessage: string) => {
    try {
        const encryptedPrivateKey = await getPrivateKey(senderId)
        if (!encryptedPrivateKey) throw new Error('Private key not found')
        const privateKey = await decryptPrivateKey(encryptedPrivateKey)
        if (!privateKey) throw new Error('Private key not found')
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