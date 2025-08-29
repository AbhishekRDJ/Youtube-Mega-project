import { Subcription } from "../models/subcription.model.js";

export const requireActiveSubscription = async (req, res, next) => {
    try {
        const { channelId } = req.query;
        if (!channelId) {
            return res.status(400).json({ message: "channelId is required" });
        }
        const exists = await Subcription.exists({ subscriber: req.user?._id, channel: channelId });
        if (!exists) {
            return res.status(402).json({ message: "Subscription required" });
        }
        next();
    } catch (error) {
        next(error);
    }
};


