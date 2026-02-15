// src/dtos/category.schema.ts
import { z } from "zod";


export const categoryNameValidation = z
    .string()
    .min(2, { message: "Category Name must be atleast 2 characters long" })
    .max(50, { message: "Category Name must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9 ]+$/, { message: "Category Name must contain only alphabets, numbers and spaces" });

export const categoryDescriptionValidation = z
    .string()
    .min(5, { message: "Category Description must be atleast 5 characters long" })
    .max(500, { message: "Category Description must not exceed 500 characters" })
    .regex(/^[a-zA-Z0-9 .,!?]+$/, { message: "Category Description must contain only alphabets, numbers and basic punctuation" });

export const categoryStatusValidation = z
    .enum(["active", "inactive"], { message: "Category Status must be either active or inactive" });