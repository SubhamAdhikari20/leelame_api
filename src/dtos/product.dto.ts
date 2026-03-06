// src/dtos/product.dto.ts
import { z } from "zod";
import { productNameValidation, productDescriptionValidation, productStartPriceValidation, productBidIntervalPriceValidation, productCommissionValidation, productBuyNowPriceValidation } from "./../schemas/product.schema.ts";


// Create Product DTO
export const CreateProductDto = z.object({
    productName: productNameValidation,
    description: productDescriptionValidation.nullish(),
    startPrice: productStartPriceValidation,
    bidIntervalPrice: productBidIntervalPriceValidation,
    buyNowPrice: productBuyNowPriceValidation.nullish(),
    endDate: z.coerce.date(),
    categoryId: z.string(),
    conditionId: z.string()
});
export type CreateProductDtoType = z.infer<typeof CreateProductDto>;

// Update Product DTO
export const UpdateProductDto = z.object({
    productName: productNameValidation,
    description: productDescriptionValidation.nullish(),
    startPrice: productStartPriceValidation,
    bidIntervalPrice: productBidIntervalPriceValidation,
    buyNowPrice: productBuyNowPriceValidation.nullish(),
    endDate: z.coerce.date(),
    removedExisitingProductImageUrls: z.array(z.string()),
    categoryId: z.string(),
    conditionId: z.string()
});
export type UpdateProductDtoType = z.infer<typeof UpdateProductDto>;

// Verify And Set Commission For Product By Admin DTO
export const VerifyAndSetCommissionForProductByAdminDto = z.object({
    commission: productCommissionValidation,
    isVerified: z.boolean(),
});
export type VerifyAndSetCommissionForProductByAdminDtoType = z.infer<typeof VerifyAndSetCommissionForProductByAdminDto>;


// Product Response Dto
export const ProductResponseDto = z.object({
    _id: z.string(),
    productName: z.string(),
    description: z.string().nullish(),
    commission: z.number(),
    startPrice: z.number(),
    currentBidPrice: z.number(),
    bidIntervalPrice: z.number(),
    buyNowPrice: z.number().nullish(),
    endDate: z.date(),
    productImageUrls: z.array(z.string()),
    isVerified: z.boolean(),
    isSoldOut: z.boolean(),
    sellerId: z.string(),
    categoryId: z.string(),
    conditionId: z.string(),
    soldToBuyerId: z.string().nullish(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type ProductResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof ProductResponseDto> | null;
};

// All the products response
export type AllProductsResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof ProductResponseDto>[] | null;
};