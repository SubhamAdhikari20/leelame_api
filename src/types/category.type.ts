// src/types/category.type.ts
import { z } from "zod";
import { categoryNameValidation, categoryDescriptionValidation, categoryStatusValidation } from "./../schemas/category.schema.ts";
import type { ICategory } from "./../models/category.model.ts";


const categorySchema = z.object({
    categoryName: categoryNameValidation,
    description: categoryDescriptionValidation.nullish(),
    categoryStatus: categoryStatusValidation,
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryDocument = ICategory;