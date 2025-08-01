import dotenv from 'dotenv'
import mongoose from "mongoose";
import connnectDB from "./db/index.js"

dotenv.config({
    Path: './env'
})
connnectDB()