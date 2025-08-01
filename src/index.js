import dotenv from 'dotenv'

import mongoose from "mongoose";
import connnectDB from "./db/index.js"


dotenv.config({
    Path: './env'
})





connnectDB()
























/*
(async()=>{
try {
    mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    app.on("error",()=>{
    console.error("ERROR: " ,error)
     throw err
    })
    app.listen(process.env.PORT, () => {
        console.log(`App is listenon on port ${process.env.PORT}`)
    })
} catch (error) {
    console.error("ERROR: " ,error)
    throw err
}
})() 
*/