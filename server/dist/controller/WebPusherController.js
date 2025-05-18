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
const WebPusher_1 = __importDefault(require("../config/WebPusher"));
const model_1 = __importDefault(require("../model/model"));
const webPusherController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.user.userId;
        const subscription = req.body;
        const doesSubscriptionExist = yield model_1.default.Subscription.findOne({ userId });
        if (doesSubscriptionExist) {
            yield doesSubscriptionExist.updateOne({ subscription });
            res.status(200).json({ message: 'Subscription saved' });
            return;
        }
        const newSubscription = new model_1.default.Subscription({
            userId,
            subscription
        });
        yield newSubscription.save();
        res.status(200).json({ message: 'user subscribed' });
    }
    catch (error) {
        res.status(500).json({ message: 'subscription not saved' });
        console.error(error);
    }
});
const sendDataToWebPush = (to, message) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield model_1.default.Subscription.findOne({ userId: to });
    if (!subscription) {
        return;
    }
    WebPusher_1.default.sendNotification(subscription.subscription, JSON.stringify(message));
});
exports.default = {
    webPusherController,
    sendDataToWebPush
};
