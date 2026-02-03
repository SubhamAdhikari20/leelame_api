// src/utils/upload-media.util.ts
import path from "path";
import fs from "fs";
import type { Express } from "express";
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
    // if (!file?.buffer) {
    //     throw new HttpError(400, "No file buffer available.");
    // }

    let baseDir = "other";
    if (file.mimetype.startsWith("image/")) {
        baseDir = "images";
    } else if (file.mimetype.startsWith("video/")) {
        baseDir = "videos";
    }

    const subFolderClean = subFolder.replace(/^\/+|\/+$/g, "").trim();

    if (MEDIA_STORAGE_PROVIDER === "local") {
        // const uploadDir = path.join(process.cwd(), "public/uploads", baseDir, subFolderClean);
        // await fs.promises.mkdir(uploadDir, { recursive: true });

        // const ext = path.extname(file.originalname);
        // let prefix = "";
        // if (file.fieldname === "profilePicture") {
        //     prefix = "pro-pic-";
        // } else if (file.fieldname === "productImage") {
        //     prefix = "prod-img-";
        // }

        // const filename = `${prefix}${uuidv4()}${ext}`;
        // const fullPath = path.join(uploadDir, filename);
        // await fs.promises.writeFile(fullPath, file.buffer);

        // const relativePath = path.relative(path.join(process.cwd(), "public"), fullPath);
        // const urlPath = relativePath.split(path.sep).join("/");
        // return `/${urlPath}`;


        // For local, construct the public URL
        const PUBLIC_DIR = path.join(process.cwd(), "public"); // root project
        const relativePath = path.relative(PUBLIC_DIR, file.path);
        const urlPath = relativePath.split(path.sep).join("/"); // normalize slashes to forward
        const publicUrl = `/${urlPath.replace(/^\/+/, "")}`; // ensure single slash
        return publicUrl;
    }
    else if (MEDIA_STORAGE_PROVIDER === "cloudinary") {
        const fullFolder = `leelame/uploads/${baseDir}/${subFolderClean}`.replace(/^\/+|\/+$/g, "");
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

        // return Promise.all(files.map(async (file) => {
        //     if (!file?.buffer) {
        //         throw new HttpError(400, "No file buffer available.");
        //     }

        //     let baseDir = "other";
        //     if (file.mimetype.startsWith("image/")) {
        //         baseDir = "images";
        //     } else if (file.mimetype.startsWith("video/")) {
        //         baseDir = "videos";
        //     }

        //     const subFolderClean = subFolder.replace(/^\/+|\/+$/g, "").trim();

        //     const uploadDir = path.join(process.cwd(), "public/uploads", baseDir, subFolderClean);
        //     await fs.promises.mkdir(uploadDir, { recursive: true });

        //     const ext = path.extname(file.originalname);
        //     let prefix = "";
        //     if (file.fieldname === "profilePicture") {
        //         prefix = "pro-pic-";
        //     } else if (file.fieldname === "productImage") {
        //         prefix = "prod-img-";
        //     }

        //     const filename = `${prefix}${uuidv4()}${ext}`;
        //     const fullPath = path.join(uploadDir, filename);
        //     await fs.promises.writeFile(fullPath, file.buffer);

        //     const relativePath = path.relative(path.join(process.cwd(), "public"), fullPath);
        //     const urlPath = relativePath.split(path.sep).join("/");
        //     return `/${urlPath}`;
        // }));
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

// Helper to extract Cloudinary public_id from secure_url
const getCloudinaryPublicId = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes("cloudinary.com")) {
            return null;
        }

        // Match the part after /upload/ (optionally after version v123/)
        const match = parsed.pathname.match(/\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+)/);
        if (!match) {
            return null;
        }

        // Remove file extension (Cloudinary public_id does not include extension)
        const fullPath = match[1];
        if (!fullPath) {
            return null;
        }

        return fullPath.replace(/\.\w+$/, "");
    } catch {
        return null;
    }
};

// Helper to get absolute local file path from relative URL
const getLocalFilePath = (url: string): string | null => {
    // Local URLs are relative and start with /
    if (!url.startsWith("/") || url.includes("://")) {
        return null;
    }

    const PUBLIC_DIR = path.join(process.cwd(), "public");
    const cleanPath = url.replace(/^\/+/, ""); // Remove leading slashes
    const fullPath = path.join(PUBLIC_DIR, cleanPath);

    return fullPath;
};

// New function: Delete uploaded media (used for rollback or replacing old profile pictures)
export const processDeleteUpload = async (url: string): Promise<void> => {
    if (!url || typeof url !== "string") {
        throw new HttpError(400, "Invalid url!");;
    }

    try {
        if (MEDIA_STORAGE_PROVIDER === "cloudinary") {
            const publicId = getCloudinaryPublicId(url);
            if (!publicId) {
                throw new HttpError(400, `Could not extract public_id from Cloudinary URL for deletion: ${url}`);
            }

            const result = await cloudinary.uploader.destroy(publicId, {
                invalidate: true,
                resource_type: "image",
            });

            if (result?.result === "not found" || result?.result === "missing") {
                const resVideo = await cloudinary.uploader.destroy(publicId, {
                    invalidate: true,
                    resource_type: "video",
                });
                if (resVideo?.result === "not found" || resVideo?.result === "missing") {
                    throw new HttpError(400, "The media couldn't be deleted.");
                }
            }
        }
        else if (MEDIA_STORAGE_PROVIDER === "local") {
            const filePath = getLocalFilePath(url);
            if (!filePath) {
                throw new HttpError(400, `Invalid local URL for deletion: ${url}`);
            }

            await fs.promises.unlink(filePath);
        }
    }
    catch (error: Error | any) {
        throw new HttpError(500, error.message ?? "Failed to delete uploaded file");
    }
};