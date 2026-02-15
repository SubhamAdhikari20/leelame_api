// src/dtos/category.dto.ts
import { z } from "zod";
import { categoryNameValidation, categoryDescriptionValidation, categoryStatusValidation } from "./../schemas/category.schema.ts";


// Create Category DTO
export const CreateCategoryDto = z.object({
    categoryName: categoryNameValidation,
    description: categoryDescriptionValidation,
    categoryStatus: categoryStatusValidation,
});
export type CreateCategoryDtoType = z.infer<typeof CreateCategoryDto>;

// Update Category DTO
export const UpdateCategoryDto = z.object({
    categoryName: categoryNameValidation,
    description: categoryDescriptionValidation,
    categoryStatus: categoryStatusValidation,
});
export type UpdateCategoryDtoType = z.infer<typeof UpdateCategoryDto>;


// Category Response Dto
export const CategoryResponseDto = z.object({
    _id: z.string(),
    categoryName: z.string(),
    description: z.string().nullish(),
    categoryStatus: z.string(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type CategoryResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof CategoryResponseDto> | null;
};

// All the categories response
export type AllCategoriesResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof CategoryResponseDto>[] | null;
};