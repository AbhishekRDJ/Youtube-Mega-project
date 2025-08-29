import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js';
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
    //get the user from frontend
    const { username, fullname, email, password } = req.body;
    // console.log(username, fullname, email, password);

    // validation
    if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // normalize for duplicate checks (avoid case-sensitivity causing duplicates)
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    // if (!fullname) {
    //     throw new ApiError(400, "fullname is not provided")
    // }

    // check if already exist
    const existedUser = await User.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    })
    if (existedUser) throw new ApiError(409, "User Already exist") // <-- throw instead of return

    // check for images and check for avatar
    // console.log('req.files:', req.files); // debug: ensure multer saved files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is require")
    }

    // we will upload to cloudinary
    const avatarCloudinaryUrl = await uploadOnCloudinary(avatarLocalPath)
    // Only try to upload cover if client actually sent one; else keep it null
    const coverImageCloudinaryUrl = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    // console.log(avatarCloudinaryUrl);

    if (!avatarCloudinaryUrl) throw new ApiError(400, "Avatar not upload correectly");

    // create user  object- call for creation call in DB
    const user = await User.create({
        fullname,
        avatar: avatarCloudinaryUrl.secure_url || avatarCloudinaryUrl.url,
        coverImage: coverImageCloudinaryUrl ? (coverImageCloudinaryUrl.secure_url || coverImageCloudinaryUrl.url) : "",
        email: normalizedEmail,
        password,
        username: normalizedUsername
    })

    // remove the password from res
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // check for user created or not
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    // return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User Register Succeefully")
    )

})

const login = asyncHandler(async (req, res) => {
    // we will take the email and username
    // we will check if user exist using user name or email
    // check password 

    // if user exist res=> all object of user send with access token and refresh token
    // send secure cookies


    const { email, username, password } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "UserName or Password is require")

    }

    const gotuser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!gotuser) throw new ApiError(404, "User does not exist")

    const ispasswordvalid = await gotuser.ispasswordCorrect(password)
    if (!ispasswordvalid) throw new ApiError(404, "User does not have valid password")



    const accessToken = await gotuser.generteAccessToken(gotuser._id)
    const refreshToken = await gotuser.generteRefreshToken(gotuser._id)

    gotuser.refreshToken = refreshToken;
    await gotuser.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: gotuser, accessToken, refreshToken }, "User logged In Successfully"))

})


const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined

        }
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", "", options)
        .clearCookie("refreshToken", "", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingrefreshToken) throw new ApiError(401, "unautherioed request")
    try {
        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SCRET)
        const user = User.findById(decodedToken?._id)
        if (!user) throw new ApiError(401, "invalid refreshtoken")
        if (incomingrefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used")

        const accessToken = await user.generteAccessToken(user._id)
        const newRefreshToken = await user.generteRefreshToken(user._id)

        user.refreshToken = newRefreshToken
        await user.save({ validateBeforeSave: false })

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken, user }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(500, "something went wrong in user.controller.js with refreshAccessToken function")

    }

})


const currentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id)
    const ispasswordcorrect = await user.ispasswordCorrect();

    if (!ispasswordcorrect) throw new ApiError(400, "invalid old password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "password change successfully"))
});


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))

})

const updateAccountDetail = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "Fullname and email are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) throw new ApiError(400, "avatar file is missing")

    // upload to cloudinary
    const newavatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(500, "api error while uploading the avatar to cloudinary")

    const user = await User.findById(req.user?._id, {
        $set: {
            avatar: newavatar.url
        }
    }, { new: true }).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))



})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) throw new ApiError(400, "coverimage file is missing")

    // upload to cloudinary
    const coverimage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) throw new ApiError(500, "api error while uploading the coverimage to cloudinary")

    const user = await User.findById(req.user?._id, {
        $set: {
            coverImage: coverimage.url
        }
    }, { new: true }).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"))





})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) throw new ApiError(400, "username is required")
    const channel = User.aggregate([{
        $match: { username: username?.toLowerCase() }

    }, {
        $lookup: {
            from: "subcriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subcribers"
        }
    }, {
        $lookup: {
            from: "subcriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    }, {
        $addFields: {
            subcribersCount: { $size: "$subcribers" },
            channelsSubscribedToCount: { $size: "$subscribedTo" },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subcribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        }
    }, {
        $project: {
            fullname: 1,
            username: 1,
            subcribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
        }
    }])
    console.log(channel);
    if (!channel || channel.length === 0) throw new ApiError(404, "Channel not found")
    return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
})

export {
    registerUser, login, logout, refreshAccessToken, currentUserPassword, getCurrentUser, updateAccountDetail, updateUserAvatar, updateUserCoverImage, getUserChannelProfile
}
