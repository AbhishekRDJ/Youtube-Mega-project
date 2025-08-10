import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js';
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    //get the user from frontend
    const { username, fullname, email, password } = req.body;
    console.log(username, fullname, email, password);

    // validation
    if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // if (!fullname) {
    //     throw new ApiError(400, "fullname is not provided")
    // }


    // check if already exist
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) return ApiError(409, "User Already exist")
    // check for images and check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is require")
    }

    // we will upload to cloudinary
    const avatarCloudinaryUrl = await uploadOnCloudinary(avatarLocalPath)
    const coverImageCloudinaryUrl = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatarCloudinaryUrl) throw new ApiError(400, "Avatar not upload correectly");

    // create user  object- call for creation call in DB
    const user = await User.create({
        fullname,
        avatar: avatarCloudinaryUrl.url,
        coverImage: coverImageCloudinaryUrl?.url || "",
        email,
        password,
        username: username.toLowerCase()
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

export { registerUser }