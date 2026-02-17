// src/dtos/product.schema.ts
import { z } from "zod";


export const productNameValidation = z
    .string()
    .min(2, { message: "Product Name must be atleast 2 characters long" })
    .max(50, { message: "Product Name must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9 &]+$/, { message: "Product Name must contain only alphabets, numbers and spaces" });

export const productDescriptionValidation = z
    .string()
    .min(5, { message: "Product Description must be atleast 5 characters long" })
    .max(500, { message: "Product Description must not exceed 500 characters" })
    .regex(/^[a-zA-Z0-9 &.,!?]+$/, { message: "Product Description must contain only alphabets, numbers and basic punctuation" });

export const productCommissionValidation = z
    .number()
    .min(0, { message: "Product Commission must be a positive number" })
    .max(100, { message: "Product Commission must not exceed 100%" });

export const productStartPriceValidation = z
    .number()
    .min(0, { message: "Product Start Price must be a positive number" });

export const productCurrentBidPriceValidation = z
    .number()
    .min(0, { message: "Product Current Bid Price must be a positive number" });

export const productBidIntervalPriceValidation = z
    .number()
    .min(0, { message: "Product Bid Interval Price must be a positive number" });