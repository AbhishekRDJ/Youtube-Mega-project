// it will check the does user exist

import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) throw new ApiError(401, "unauthorized request")

        const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SCRET)
        const user = await User.findById(decodedTokenInfo._id).select("-password -refreshToken")
        if (!user) throw new ApiError(401, "invalid access token")
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong in auth middleware")

    }
}) 