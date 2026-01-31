// src/config/cloudinary.config.ts
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import { HttpError } from "./../errors/http-error.ts";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config.env") });

const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
export const MEDIA_STORAGE_PROVIDER = process.env.MEDIA_STORAGE_PROVIDER || "cloudinary"; // "local" by default
export const BASE_URL = process.env.BASE_URL;

if (MEDIA_STORAGE_PROVIDER === "cloudinary") {
    if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
        throw new HttpError(
            400,
            "Missing Cloudinary environment variables. Please set CLOUD_NAME, CLOUD_API_KEY and CLOUD_API_SECRET."
        );
    }

    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
        secure: true,
    });
}
else if (!["local", "cloudinary"].includes(MEDIA_STORAGE_PROVIDER)) {
    throw new HttpError(400, "Invalid STORAGE_PROVIDER. Must be 'local' or 'cloudinary'.");
}

export { cloudinary };