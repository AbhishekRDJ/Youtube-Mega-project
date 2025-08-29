import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoute from "./routes/user.route.js"
import videoRoute from "./routes/video.route.js"
import subscriptionRoute from "./routes/subscription.route.js"
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'


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
app.use("/api/v1/videos", videoRoute)
app.use("/api/v1/subscriptions", subscriptionRoute)

// Swagger docs
const swaggerPath = path.join(process.cwd(), 'src', 'docs', 'swagger.json')
if (fs.existsSync(swaggerPath)) {
    const spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))
}

export { app }