import { registerUser, login, logout, refreshAccessToken } from "../controller/user.controller.js";
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
export default router