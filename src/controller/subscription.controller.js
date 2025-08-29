import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Subcription } from "../models/subcription.model.js";

// For demo purposes, use static plans. In production, store in DB.
const PLANS = [
    { id: "free", name: "Free", price: 0, features: ["Basic access"] },
    { id: "pro", name: "Pro", price: 9.99, features: ["HD streaming", "No ads"] },
    { id: "premium", name: "Premium", price: 19.99, features: ["4K streaming", "No ads", "Priority support"] }
];

const getPlans = asyncHandler(async (_req, res) => {
    return res.status(200).json(new ApiResponse(200, PLANS, "Plans fetched"));
});

const subscribe = asyncHandler(async (req, res) => {
    const { channelId, planId } = req.body;
    if (!channelId || !planId) throw new ApiError(400, "channelId and planId are required");
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new ApiError(400, "Invalid planId");

    const record = await Subcription.findOneAndUpdate(
        { subscriber: req.user?._id, channel: channelId },
        { $setOnInsert: { subscriber: req.user?._id, channel: channelId } },
        { upsert: true, new: true }
    );

    return res.status(200).json(new ApiResponse(200, { subscription: record, plan }, "Subscribed"));
});

const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) throw new ApiError(400, "channelId is required");
    const exists = await Subcription.exists({ subscriber: req.user?._id, channel: channelId });
    return res.status(200).json(new ApiResponse(200, { active: Boolean(exists) }, "Subscription status"));
});

export { getPlans, subscribe, getSubscriptionStatus };


