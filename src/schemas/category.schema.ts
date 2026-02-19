// src/dtos/category.schema.ts
import { z } from "zod";


export const categoryNameValidation = z
    .string()
    .min(2, { message: "Category Name must be atleast 2 characters long" })
    .max(50, { message: "Category Name must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9 &()\-_\[\]{}|/]+$/, { message: "Category Name must contain only alphabets, numbers, spaces, and common punctuation (brackets, slash, hyphens, etc." });
// .regex(/^[a-zA-Z0-9 &]+$/, { message: "Category Name must contain only alphabets, numbers and spaces" });

export const categoryDescriptionValidation = z
    .string()
    .max(500, { message: "Category Description must not exceed 500 characters" })
    .regex(
        /^[a-zA-Z0-9\s.,!?@#$%^&*()\-_+=\[\]{}|;:'"\\<>/`~]+$/i,
        {
            message: "Category Description can only contain letters, numbers, spaces, and common punctuation (brackets, quotes, hyphens, etc.)"
        }
    );

export const categoryStatusValidation = z
    .enum(["active", "inactive"], { message: "Category Status must be either active or inactive" });