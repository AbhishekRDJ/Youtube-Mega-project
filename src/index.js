import connectDB from './db/db.js'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

connectDB();