// src/schema/payment.schema.ts
import { z } from "zod";


export const amountValidation = z
    .coerce
    .number()
    .positive({ message: "Amount must be a positive number" });

// export const methodValidation = z
//     .string()
//     .min(1, { message: "Payment method is required" });

export const methodValidation = z
    .enum(["esewa", "khalti"], { message: "Invalid payment method" });

export const statusValidation = z
    .enum(["pending", "success", "failed"], { message: "Invalid payment status" });