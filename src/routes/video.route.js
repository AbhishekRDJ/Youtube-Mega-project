import Router from 'express'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllVideos, getVideosByCategory, getVideoById, uploadVideo, likeVideo, addComment, getComments } from "../controller/video.controller.js";
import { validateVideoUpload } from "../middlewares/validateUpload.middleware.js";

const router = Router();

router.get('/', getAllVideos);
router.get('/category/:category', getVideosByCategory);

// router.post(
//     '/upload',
//     verifyJWT,
//     upload.fields([
//         { name: 'video', maxCount: 1 },
//         { name: 'thumbnail', maxCount: 1 }
//     ]),
//     validateVideoUpload,
//     uploadVideo
// );
router.post(
    '/upload',
    verifyJWT,
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'videoFile', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
        { name: 'thumb', maxCount: 1 }
    ]),
    validateVideoUpload,
    uploadVideo
);
router.get('/:id', getVideoById);


router.post('/:id/like', verifyJWT, likeVideo);
router.post('/:id/comments', verifyJWT, addComment);
router.get('/:id/comments', getComments);

export default router;


