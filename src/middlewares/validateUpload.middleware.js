const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
const ALLOWED_VIDEO_MIME = [
    "video/mp4",
    "video/quicktime",
    "video/x-matroska",
    "video/webm"
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_MIME = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

export const validateVideoUpload = (req, res, next) => {
    const videoFile = req.files?.video?.[0] || req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0] || req.files?.thumb?.[0];

    if (!videoFile || !thumbnailFile) {
        return res.status(400).json({ message: "Video and thumbnail files are required" });
    }

    if (!ALLOWED_VIDEO_MIME.includes(videoFile.mimetype)) {
        return res.status(400).json({ message: "Unsupported video format" });
    }
    if (videoFile.size > MAX_VIDEO_SIZE_BYTES) {
        return res.status(400).json({ message: "Video file too large" });
    }

    if (!ALLOWED_IMAGE_MIME.includes(thumbnailFile.mimetype)) {
        return res.status(400).json({ message: "Unsupported thumbnail image format" });
    }
    if (thumbnailFile.size > MAX_IMAGE_SIZE_BYTES) {
        return res.status(400).json({ message: "Thumbnail file too large" });
    }

    next();
}


