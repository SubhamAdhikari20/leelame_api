// src/schemas/bid.schema.ts
import { z } from "zod";


export const bidAmountValidation = z
    .coerce
    .number()
    .min(0, { message: "Bid Amount must be a positive number" });