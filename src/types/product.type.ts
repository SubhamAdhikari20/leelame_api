// src/types/product.type.ts
import { z } from "zod";
import type { IProduct } from "./../models/product.model.ts";
// import { productNameValidation, productDescriptionValidation, productStartPriceValidation, productBidIntervalPriceValidation, productCurrentBidPriceValidation, productCommissionValidation } from "./../schemas/product.schema.ts";


const productSchema = z.object({
    sellerId: z.string(),
    productName: z.string(),
    description: z.string().nullish(),
    commission: z.number(),
    startPrice: z.number(),
    currentBidPrice: z.number(),
    bidIntervalPrice: z.number(),
    endDate: z.date(),
    productImageUrls: z.array(z.string()),
    categoryId: z.string(),
    conditionId: z.string(),
    isVerified: z.boolean(),
    isSoldOut: z.boolean(),
    soldToBuyerId: z.string().nullish(),

    // productName: productNameValidation,
    // description: productDescriptionValidation.nullish(),
    // commission: productCommissionValidation,
    // startPrice: productStartPriceValidation,
    // currentBidPrice: productCurrentBidPriceValidation,
    // bidIntervalPrice: productBidIntervalPriceValidation,
});

export type Product = z.infer<typeof productSchema>;
export type ProductDocument = IProduct;

// verify and set commission for product by admin
const verifyAndSetCommissionForProductByAdminSchema = z.object({
    isVerified: z.boolean(),
    commission: z.number(),
});
export type VerifyAndSetCommissionForProductByAdmin = z.infer<typeof verifyAndSetCommissionForProductByAdminSchema>;
