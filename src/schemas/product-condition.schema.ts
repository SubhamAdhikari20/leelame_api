// src/schemas/product-condition.schema.ts
import { z } from "zod";


export const productConditionNameValidation = z
    .string()
    .min(2, { message: "Product Condition Name must be atleast 2 characters long" })
    .max(50, { message: "Product Condition Name must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9 &()\-_\[\]{}|/]+$/, { message: "Product Condition Name must contain only alphabets, numbers, spaces, and common punctuation (brackets, slash, hyphens, etc." });

export const productConditionDescriptionValidation = z
    .string()
    .max(500, { message: "Product Condition Description must not exceed 500 characters" })
    .regex(
        /^[a-zA-Z0-9\s.,!?@#$%^&*()\-_+=\[\]{}|;:'"\\<>/`~]+$/i,
        {
            message: "Product Condition Description can only contain letters, numbers, spaces, and common punctuation (brackets, quotes, hyphens, etc.)"
        }
    );

export const productConditionEnumValidation = z
    .enum(["NEW", "NEW_OTHER", "NEW_WITH_DEFECTS", "CERTIFIED_REFURBISHED", "EXCELLENT_REFURBISHED", "VERY_GOOD_REFURBISHED", "GOOD_REFURBISHED", "SELLER_REFURBISHED", "LIKE_NEW", "PRE_OWNED_EXCELLENT", "USED_EXCELLENT", "PRE_OWNED_FAIR", "USED_VERY_GOOD", "USED_GOOD", "USED_ACCEPTABLE", "FOR_PARTS_OR_NOT_WORKING"], { message: "Product Condition Enum must be one of the predefined values" });