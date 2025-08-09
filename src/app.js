import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoute from "./routes/user.route.js"


const app = express()
app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))

app.use(cookieParser())


// here will route come

app.use("/api/v1/users", userRoute)

export { app }