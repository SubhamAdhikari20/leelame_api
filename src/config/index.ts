// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "config.env") });

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050;
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/default_db";
export const JWT_SECRET: string = process.env.JWT_SECRET || "leelame_secret";