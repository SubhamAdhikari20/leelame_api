// src/schemas/invoice.schema.ts
import { z } from "zod";

export const buyerNameValidation = z
    .string()
    .min(1, { message: "Buyer name is required" });

export const buyerContactValidation = z
    .string()
    .min(10, { message: "Buyer Contact must be 10 digits long" })
    .max(10, { message: "Buyer Contact must be 10 digits long" })
    .regex(/^[0-9]+$/, { message: "Buyer Contact must contain only digits" });

export const sellerNameValidation = z
    .string()
    .min(1, { message: "Seller name is required" });

export const sellerContactValidation = z
    .string()
    .min(10, { message: "Seller Contact must be 10 digits long" })
    .max(10, { message: "Seller Contact must be 10 digits long" })
    .regex(/^[0-9]+$/, { message: "Seller Contact must contain only digits" });

export const productNameValidation = z
    .string()
    .min(1, { message: "Product name is required" });

export const priceValidation = z
    .coerce
    .number()
    .positive({ message: "Price must be a positive number" });

export const totalPriceValidation = z
    .coerce
    .number()
    .positive({ message: "Total price must be a positive number" });

export const serviceChargeValidation = z
    .coerce
    .number()
    .nonnegative({ message: "Service charge must be a non-negative number" });

export const paymentMethodValidation = z
    .enum(["khalti", "esewa"], { message: "Invalid payment method" });