import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
        Video.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "username fullname avatar"),
        Video.countDocuments({ isPublished: true })
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { items: videos, page, limit, total }, "Videos fetched"));
});

const getVideosByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
        Video.find({ isPublished: true, description: { $regex: category, $options: "i" } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "username fullname avatar"),
        Video.countDocuments({ isPublished: true, description: { $regex: category, $options: "i" } })
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { items: videos, page, limit, total }, "Category videos fetched"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner", "username fullname avatar");
    if (!video) throw new ApiError(404, "Video not found");
    return res.status(200).json(new ApiResponse(200, video, "Video fetched"));
});

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const videoLocalPath = req.files?.video?.[0]?.path || req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path || req.files?.thumb?.[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required");
    }

    const [videoUpload, thumbnailUpload] = await Promise.all([
        uploadOnCloudinary(videoLocalPath),
        uploadOnCloudinary(thumbnailLocalPath)
    ]);

    if (!videoUpload || !thumbnailUpload) {
        throw new ApiError(500, "Failed to upload media to Cloudinary");
    }

    const created = await Video.create({
        videoFile: videoUpload.secure_url || videoUpload.url,
        thumbnail: thumbnailUpload.secure_url || thumbnailUpload.url,
        title,
        description,
        duration: Number(videoUpload.duration) || 0,
        owner: req.user?._id
    });

    return res.status(201).json(new ApiResponse(201, created, "Video uploaded"));
});

const likeVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const video = await Video.findById(id);
    if (!video) throw new ApiError(404, "Video not found");

    await Like.findOneAndUpdate(
        { video: id, user: userId },
        { $setOnInsert: { video: id, user: userId } },
        { upsert: true, new: true }
    );

    const likeCount = await Like.countDocuments({ video: id });
    return res.status(200).json(new ApiResponse(200, { likes: likeCount }, "Video liked"));
});

const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    if (!text?.trim()) throw new ApiError(400, "Comment text is required");

    const video = await Video.findById(id);
    if (!video) throw new ApiError(404, "Video not found");

    const created = await Comment.create({ video: id, user: req.user?._id, text });
    return res.status(201).json(new ApiResponse(201, created, "Comment added"));
});

const getComments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        Comment.find({ video: id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username fullname avatar"),
        Comment.countDocuments({ video: id })
    ]);

    return res.status(200).json(new ApiResponse(200, { items: comments, page, limit, total }, "Comments fetched"));
});

export { getAllVideos, getVideosByCategory, getVideoById, uploadVideo, likeVideo, addComment, getComments };


