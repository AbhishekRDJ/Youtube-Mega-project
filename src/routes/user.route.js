import { registerUser } from "../controller/user.controller.js";
import Router from 'express'
const router = Router()

router.route("/register").post(registerUser)

export default router