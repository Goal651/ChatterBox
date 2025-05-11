import webPush from '../config/WebPusher';
import { Request, Response } from "express";
import model from '../model/model';

const webPusherController = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId
        const subscription = req.body;
        const doesSubscriptionExist = await model.Subscription.findOne({ userId })
        if (doesSubscriptionExist) {
            await doesSubscriptionExist.updateOne({ subscription })
            res.status(200).json({ message: 'Subscription saved' })
            return
        }
        const newSubscription = new model.Subscription({
            userId,
            subscription
        });
        await newSubscription.save();
        res.status(200).json({ message: 'user subscribed' })
    } catch (error) {
        res.status(500).json({message:'subscription not saved'})
        console.error(error)
    }
};

const sendDataToWebPush = async (to: string, message: object) => {
    const subscription = await model.Subscription.findOne({ userId: to });
    if (!subscription) {
        return;
    }
    webPush.sendNotification(subscription.subscription, JSON.stringify(message));
};

export default {
    webPusherController,
    sendDataToWebPush
};
