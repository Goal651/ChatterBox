import { Request, Response } from 'express'
import { Message, GroupMessage } from '@/interfaces/interface'
import model from '@/model/model'


const getMessage = async (req: Request, res: Response) => {
    try {
        const { receiverId } = req.params as unknown as { receiverId: string }
        const { userId } = res.locals.user

        if (!userId || !receiverId) {
            res.status(200).json({ message: 'Sender and receiver are required', isError: true })
            return
        }

        const messages = await model.Message
            .find({
                $or: [
                    { sender: userId, receiver: receiverId },
                    { sender: receiverId, receiver: userId },
                ],
            })
            .sort({ createdAt: -1 }) as unknown[] as Message[]

        if (messages.length <= 0) {
            res.status(200).json({ messages: [], isError: false })
            return
        }

        res.status(200).json({ messages: messages.reverse(), isError: false })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

const getGMessage = async (req: Request, res: Response) => {
    try {
        const { group } = req.params
        const groupData = await model.Group.findById(group)

        if (!groupData) {
            res.status(200).json({ message: 'Group not found', isError: true })
            return
        }


        const messages = await model.GMessage.find({ group })
            .sort({ createdAt: -1 }) as unknown[] as GroupMessage[]

        if (messages.length <= 0) {
            res.status(200).json({ messages: [], isError: false })
            return
        }


        res.status(200).json({ messages:messages.reverse(), isError: false })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Reloading...' })
    }
}



export default {
    getMessage,
    getGMessage,
}
