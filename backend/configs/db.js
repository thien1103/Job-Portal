import mongoose from "mongoose";
import { setupChangeStream } from "../utils/changeStream.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });
        console.log('mongodb connected successfully');
        setupChangeStream();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
export default connectDB;