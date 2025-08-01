import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstacnce = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n mongodb connection !! db HOST: ${connectionInstacnce}`)
    } catch (error) {
        console.log("mongoose connection failed",error);
        process.exit(1)
    }
}
export default connectDB;