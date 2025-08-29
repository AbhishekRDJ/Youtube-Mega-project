import { registerUser, login, logout, refreshAccessToken, changecurrentUserPassword, currentUserPassword, updateAccountDetail, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controller/user.controller.js";
import Router from 'express'
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1

        }
    ]), registerUser)

router.route("/login").post(login)

// secure routes

router.route("/logout").post(verifyJWT, logout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changecurrentUserPassword)
router.route("/current-password").post(verifyJWT, currentUserPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetail)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router