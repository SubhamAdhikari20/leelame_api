// src/utils/upload-media.util.ts
import path from "path";
import type { Express } from "express";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";
import { cloudinary, MEDIA_STORAGE_PROVIDER, BASE_URL } from "./../config/cloudinary.config.ts";
import { HttpError } from "./../errors/http-error.ts";


// Helper function to upload a single media file to Cloudinary
export const uploadMedia = async (
    buffer: Buffer,
    filename: string,
    mimetype: string,
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
                resource_type: mimetype.startsWith("image/") ? "image" : "video",
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

// Helper function to upload multiple media in the Cloudinary
export const uploadMultipleMedia = async (
    buffers: Buffer[],
    filenames: string[],
    mimetypes: string[],
    folder: string = "leelame/media"
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
                resource_type: mimetypes[i]!.startsWith("image/") ? "image" : "video",
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

// Process single upload and return URL to handles both local and cloudinary
export const processSingleUpload = async (
    file: Express.Multer.File,
    subFolder: string = ""
): Promise<string> => {
    if (MEDIA_STORAGE_PROVIDER === "local") {
        // For local, construct the public URL

        // const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // const relativePath = file.path.replace(path.join(__dirname, "./../../public"), "");
        // return `${BASE_URL}${relativePath}`;

        const PUBLIC_DIR = path.join(process.cwd(), "public"); // root project
        const relativePath = path.relative(PUBLIC_DIR, file.path);
        const urlPath = relativePath.split(path.sep).join("/"); // normalize slashes to forward
        const baseUrl = (BASE_URL || "").replace(/\/$/, ""); // remove trailing slash from BASE_URL
        const publicUrl = `/${urlPath.replace(/^\/+/, "")}`; // ensure single slash
        // const publicUrl = `${baseUrl}/${urlPath.replace(/^\/+/, "")}`; // ensure single slash
        return publicUrl;
    }
    else if (MEDIA_STORAGE_PROVIDER === "cloudinary") {
        // For Cloudinary, upload buffer
        let baseDir = "other";
        if (file.mimetype.startsWith("image/")) {
            baseDir = "images";
        } else if (file.mimetype.startsWith("video/")) {
            baseDir = "videos";
        }
        const fullFolder = `leelame/uploads/${baseDir}/${subFolder}`.replace(/^\/+|\/+$/g, "");
        return uploadMedia(file.buffer, file.originalname, file.mimetype, fullFolder);
    }
    else {
        throw new HttpError(500, "Invalid storage provider configuration.");
    }
};

// Process multiple uploads and return array of URLs (handles both local and Cloudinary)
export const processMultipleUploads = async (
    files: Express.Multer.File[],
    subFolder: string = "media"
): Promise<string[]> => {
    if (MEDIA_STORAGE_PROVIDER === "local") {
        // For local, construct public URLs
        return files.map((file) => {
            // const __dirname = path.dirname(fileURLToPath(import.meta.url));
            // const relativePath = file.path.replace(path.join(__dirname, "./../../public"), "");
            // return `${BASE_URL}${relativePath}`;

            const PUBLIC_DIR = path.join(process.cwd(), "public");
            const relativePath = path.relative(PUBLIC_DIR, file.path);
            const urlPath = relativePath.split(path.sep).join("/");
            const baseUrl = (BASE_URL || "").replace(/\/$/, "");
            const publicUrl = `${baseUrl}/${urlPath.replace(/^\/+/, "")}`;
            return publicUrl;
        });
    }
    else if (MEDIA_STORAGE_PROVIDER === "cloudinary") {
        // For Cloudinary, upload buffers
        const buffers = files.map((f) => f.buffer);
        const filenames = files.map((f) => f.originalname);
        const mimetypes = files.map((f) => f.mimetype);

        let baseDir = "other";
        if (files[0]?.mimetype.startsWith("image/")) {
            baseDir = "images";
        }
        else if (files[0]?.mimetype.startsWith("video/")) {
            baseDir = "videos";
        }

        const fullFolder = `leelame/uploads/${baseDir}/${subFolder}`.replace(/^\/+|\/+$/g, "");
        return uploadMultipleMedia(buffers, filenames, mimetypes, fullFolder);
    }
    else {
        throw new HttpError(500, "Invalid storage provider configuration.");
    }
};