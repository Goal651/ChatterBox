import { Request, Response } from "express";
import model from "../model/model";

const getNotification = async (req: Request, res: Response) => {
    try {
        const {userId} = res.locals.user
        const notifications = await model.Notification.find({ userId: userId })
        if (!notifications) {
            res.status(200).json({ notifications: [] })
            return
        }
        res.status(200).json({ notifications: notifications })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
export default {
    getNotification
}