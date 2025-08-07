import connectDB from './db/db.js'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`server is running at port ${process.env.PORT}`)
    })
    console.log("DB connected")
}).catch(() => {
    console.log(`got error in index.js file while connecting the db`);

})