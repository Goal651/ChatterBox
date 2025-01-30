import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'
import crypto from 'crypto'
import { Message, GroupMessage, User, Group } from '../interface/interface'
import model from '../model/model'
import decryptController from '../security/Decryption'



const decryptData = (data: string, aesKey: string, iv: string): string | null => {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(aesKey, 'hex'), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(Buffer.from(data, 'hex'), undefined, 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    } catch (err) {
        console.error('Error decrypting data:', err);
        return null;
    }
}

const decryptGroupMessage = (data: { iv: string, privateKey: string, message: string }): string | undefined => {
    try {
        if (!data) return
        const ivBuffer = Buffer.from(data.iv, 'hex')
        const aesKeyBuffer = Buffer.from(data.privateKey, 'hex')
        const encryptedMessage = Buffer.from(data.message, 'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer)
        let decryptedMessage = decipher.update(encryptedMessage, undefined, 'utf-8')
        decryptedMessage += decipher.final('utf-8')
        return decryptedMessage
    } catch (err) {
        console.error(err)
    }
}

const getFileData = async (filePath: string, mimeType: string): Promise<string | null> => {
    try {
        const data = await fs.promises.readFile(filePath)
        return `data:${mimeType};base64,${data.toString('base64')}`
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err)
        return null
    }
}


const decryptMessageContent = async (message: string, privateKey: string): Promise<string> => {
    try {
        return crypto.privateDecrypt(
            { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
            Buffer.from(message, 'base64')
        ).toString('utf-8')
    } catch (err) {
        console.error('Error decrypting message content:', err)
        return 'Error decrypting message'
    }
}

const formatMessageData = async (message: Message, privateKey: string) => {
    let decryptedMessage = ''
    let fileData = null

    if (message.type === 'text') {
        decryptedMessage = await decryptMessageContent(message.message, privateKey)
    } else if (message.type.startsWith('image')) {
        fileData = await getFileData(message.message, 'image/jpeg')
    } else if (message.type.startsWith('video')) {
        fileData = await getFileData(message.message, 'video/mp4')
    } else if (message.type.startsWith('audio')) {
        fileData = await getFileData(message.message, 'audio/mp3')
    } else {
        console.error('Unsupported message type:', message.type)
    }

    return { message: decryptedMessage, file: fileData }
}

const formatGroupMessageData = async ({ message, privateKey, iv }: { message: GroupMessage, privateKey: string, iv: string, aesKey: string }): Promise<{ message: string, file: string | null }> => {
    let decryptedMessage = ''
    let fileData = null

    if (message.type === 'text') {
        decryptedMessage = decryptGroupMessage({ message: message.message, privateKey, iv }) as string
    } else if (message.type.startsWith('image')) {
        fileData = await getFileData(message.message, 'image/jpeg')
    } else if (message.type.startsWith('video')) {
        fileData = await getFileData(message.message, 'video/mp4')
    } else if (message.type.startsWith('audio')) {
        fileData = await getFileData(message.message, 'audio/mp3')
    } else {
        console.error('Unsupported message type:', message.type)
    }

    return { message: decryptedMessage, file: fileData }
}

const getMessage = async (req: Request, res: Response) => {
    try {
        const { receiverId, phase } = req.params as unknown as { receiverId: string, phase: number }
        const { userId } = res.locals.user
        const numberOfMessagesToSkip = phase * 10

        if (!userId && !receiverId) {
            res.status(400).json({ message: 'Sender and receiver are required' })
            return
        }


        const messages = await model.Message
            .find({
                $or: [
                    { sender: userId, receiver: receiverId },
                    { sender: receiverId, receiver: userId },
                ],
            })
            .sort({ createdAt: -1 })
            .skip(numberOfMessagesToSkip)
            .limit(10) as unknown[] as Message[]

        if (messages.length <= 0) {
            res.status(200).json({ messages: [] })
            return
        }

        const result = await Promise.all(messages.map(async m => {
            const decryptedMessage = await decryptController.decryptMessage(m.sender.toString(), m.message)
            m.message = decryptedMessage
            return m
        }))

        res.status(200).json({ messages: result.reverse() })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

const getGMessage = async (req: Request, res: Response) => {
    try {
        const { group } = req.params
        const groupData = await model.Group.findOne({ name: group })

        if (!groupData) {
            res.status(404).json({ message: 'No messages found' })
            return
        }

        const { aesKey, iv, encryptedPrivateKey } = groupData as { aesKey: string, iv: string, encryptedPrivateKey: string }
        const privateKey = decryptData(encryptedPrivateKey, aesKey, iv) as string

        const gmessages = await model.GMessage.find({ group }).populate([
            { path: 'group' },
            { path: 'sender' },
            { path: 'replying' }
        ]) as unknown[] as GroupMessage[]

        if (gmessages.length <= 0) {
            res.status(200).json({ gmessages: null })
            return
        }

        const gmsWithDetails = gmessages.map(async (message) => {
            const senderUser = message.sender as unknown as User
            const senderUsername = senderUser ? senderUser.username : null

            const { message: decryptedMessage, file } = await formatGroupMessageData({ message, privateKey, iv, aesKey })

            let decryptedReplyingToMessage = null
            if (message.replying) {
                const replyingToMessage = message.replying as unknown as GroupMessage
                if (replyingToMessage) {
                    decryptedReplyingToMessage = { ...replyingToMessage, message: decryptGroupMessage({ message: replyingToMessage.message, privateKey, iv }) }
                }
            }

            return { ...message, senderUsername, file, message: decryptedMessage, replyingMessage: decryptedReplyingToMessage || null }
        })
        res.status(200).json({ gmessages: gmsWithDetails })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}



export default {
    getMessage,
    getGMessage,
}
