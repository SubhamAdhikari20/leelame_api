// src/dtos/product.dto.ts
import { z } from "zod";
import { productNameValidation, productDescriptionValidation, productStartPriceValidation, productBidIntervalPriceValidation } from "./../schemas/product.schema.ts";


// Create Product DTO
export const CreateProductDto = z.object({
    productName: productNameValidation,
    description: productDescriptionValidation.nullish(),
    startPrice: productStartPriceValidation,
    bidIntervalPrice: productBidIntervalPriceValidation,
    endDate: z.coerce.date(),
    // productImageUrls: z.array(z.string()),
    categoryId: z.string()
});
export type CreateProductDtoType = z.infer<typeof CreateProductDto>;

// Update Product DTO
export const UpdateProductDto = z.object({
    productName: productNameValidation,
    description: productDescriptionValidation.nullish(),
    startPrice: productStartPriceValidation,
    bidIntervalPrice: productBidIntervalPriceValidation,
    endDate: z.coerce.date(),
    removedExisitingProductImageUrls: z.array(z.string()),
    categoryId: z.string()
});
export type UpdateProductDtoType = z.infer<typeof UpdateProductDto>;


// Product Response Dto
export const ProductResponseDto = z.object({
    _id: z.string(),
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
    sellerId: z.string(),
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