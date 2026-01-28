// src/lib/upload-image.ts
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { Request } from "express";
import { HttpError } from "./../errors/http-error.ts";


// read env vars
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

// runtime validation — fail fast if missing
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

// Configuring Multer to use in-memory storage
// const storage = multer.memoryStorage();

// Ensure the uploads directory exists
// __dirname - current directory of this file
const uploadDir = path.join(__dirname, "./../../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // set upload directory
    },
    filename: function (req: Request, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
        return cb(new HttpError(400, "Only image files are allowed!"));
    }
    cb(null, true);
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB per file
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};

export const uploadImage = async (
    buffer: Buffer,
    filename: string,
    folder: string = "leelame"
): Promise<string> => {
    const basename = filename.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const publicId = `${folder}/${basename}-${timestamp}-${uniqueId}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder,
                resource_type: "image",
                overwrite: true,
            },
            (error: Error | any, result: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(result!.secure_url);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Multiple Images in the Cloudinary
export const uploadMultipleImages = async (
    buffers: Buffer[],
    filenames: string[],
    folder: string = "leelame/damages"
): Promise<string[]> => {

    return Promise.all(buffers.map((buf, i) => new Promise<string>((resolve, reject) => {
        const basename = filenames[i]!.replace(/\.[^/.]+$/, "");
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const publicId = `${folder}/${basename}-${timestamp}-${uniqueId}`;

        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder,
                resource_type: "image",
                overwrite: true,
            },
            (error: Error | any, result: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(result!.secure_url)
            }
        );
        streamifier.createReadStream(buf).pipe(stream);
    })));
};