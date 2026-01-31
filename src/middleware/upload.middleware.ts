// src/middleware/upload.middleware.ts
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { MEDIA_STORAGE_PROVIDER } from "../config/cloudinary.config.ts";
import type { Request } from "express";
import { HttpError } from "../errors/http-error.ts";

// Configure Multer storage based on provider
let storage: multer.StorageEngine;
if (MEDIA_STORAGE_PROVIDER === "local") {
    // Disk storage for local files
    storage = multer.diskStorage({
        destination: function (req: Request, file, cb) {
            let baseDir = "other";
            if (file.mimetype.startsWith("image/")) {
                baseDir = "images";
            }
            else if (file.mimetype.startsWith("video/")) {
                baseDir = "videos";
            }
            let subFolder = req.body.folder || "";
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const uploadDir = path.join(__dirname, "./../../public/uploads", baseDir, subFolder);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req: Request, file, cb) {
            const ext = path.extname(file.originalname);
            let prefix = "";
            if (file.fieldname === "profilePicture") {
                prefix = "pro-pic-";
            }
            else if (file.fieldname === "productImage") {
                prefix = "prod-img-";
            }
            cb(null, `${prefix}${uuidv4()}${ext}`);
        },
    });
}
else if (MEDIA_STORAGE_PROVIDER === "cloudinary") {
    // Memory storage for Cloudinary
    storage = multer.memoryStorage();
}
else {
    throw new HttpError(400, "Invalid MEDIA_STORAGE_PROVIDER. Must be 'local' or 'cloudinary'.");
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images or videos
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
        return cb(new HttpError(400, "Only image or video files are allowed!"));
    }
    cb(null, true);
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // max 50MB per file
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray),
};