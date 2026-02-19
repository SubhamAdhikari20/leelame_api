// src/dtos/product-condition.dto.ts
import { z } from "zod";
import { productConditionNameValidation, productConditionDescriptionValidation, productConditionEnumValidation } from "./../schemas/product-condition.schema.ts";


// Create Product Condition DTO
export const CreateProductConditionDto = z.object({
    productConditionName: productConditionNameValidation,
    description: productConditionDescriptionValidation.nullish(),
    productConditionEnum: productConditionEnumValidation,
});
export type CreateProductConditionDtoType = z.infer<typeof CreateProductConditionDto>;

// Update Product Condition DTO
export const UpdateProductConditionDto = z.object({
    productConditionName: productConditionNameValidation,
    description: productConditionDescriptionValidation.nullish(),
    productConditionEnum: productConditionEnumValidation,
});
export type UpdateProductConditionDtoType = z.infer<typeof UpdateProductConditionDto>;


// Product Condition Response Dto
export const ProductConditionResponseDto = z.object({
    _id: z.string(),
    productConditionName: z.string(),
    description: z.string().nullish(),
    productConditionEnum: z.string(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type ProductConditionResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof ProductConditionResponseDto> | null;
};

// All the product conditions response
export type AllProductConditionsResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof ProductConditionResponseDto>[] | null;
};