// src/types/category.type.ts
import { z } from "zod";
import type { ICategory } from "./../models/category.model.ts";


const categorySchema = z.object({
    categoryName: z.string(),
    description: z.string().nullish(),
    categoryStatus: z.enum(["active", "inactive"]),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryDocument = ICategory;