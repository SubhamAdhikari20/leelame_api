// src/schema/order.schema.ts
import { z } from "zod";


export const delivaryAddressValidation = z
    .string()
    .min(1, { message: "Delivery address is required" });

export const delivaryDateValidation = z
    .coerce
    .date()
    .min(new Date(), { message: "Delivery date must be in the future" });

export const totalPriceValidation = z
    .coerce
    .number()
    .positive({ message: "Total price must be a positive number" });

export const statusValidation = z
    .enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "failed"], { message: "Invalid order status" });