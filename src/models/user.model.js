import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String, require: true, unique: true, lowecase: true, trim: true, index: true
        },
        email: {
            type: String, require: true, unique: true, lowecase: true, trim: true,
        },
        fullname: {
            type: String, require: true, trim: true, index: true
        },
        avatar: {
            type: String,
            require: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            require: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true

    })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()

})

userSchema.method.ispasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)

}
userSchema.method.generteAccessToken = async function (params) {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }, process.env.Access_TOKEN_SCRET, {
        expiresIn: process.env.ACCESS_TOKEN_SCRET_EXPIRY
    })
}
userSchema.method.generteRefreshToken = async function (params) {
    jwt.sign({
        _id: this._id,

    }, process.env.REFRESH_TOKEN_SCRET, {
        expiresIn: process.env.REFRESH_TOKEN_SCRET_EXPIRY
    })
}

export const User = mongoose.model("User", userSchema)