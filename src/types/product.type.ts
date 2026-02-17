// src/types/product.type.ts
import { z } from "zod";
import type { IProduct } from "./../models/product.model.ts";


const productSchema = z.object({
    sellerId: z.string(),
    productName: z.string(),
    description: z.string().nullish(),
    categoryId: z.string(),
    commission: z.number(),
    startPrice: z.number(),
    currentBidPrice: z.number(),
    bidIntervalPrice: z.number(),
    endDate: z.date(),
    productImageUrls: z.array(z.string()),
    isVerified: z.boolean(),
    isSoldOut: z.boolean(),
    soldToBuyerId: z.string().nullish(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductDocument = IProduct;