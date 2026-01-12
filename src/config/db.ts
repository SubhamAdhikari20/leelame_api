// src/config/db.ts
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongodbUri = process.env.MONGODB_URI;
        if (!mongodbUri) {
            console.error("Missing MONGODB_URI. Please add it to config/config.env or your environment variables.".red.bold);
            process.exit(1);
        }
        const dbConnect = await mongoose.connect(mongodbUri);
        console.log(`Connected to MongoDB server......${dbConnect.connection.host}`.yellow.underline.bold);
    }
    catch (error) {
        console.log(`MongoDB connection error: ${error}`.red.underline.bold);
        process.exit(1);
    }
};

export default connectDB;