// src/types/product-condition.type.ts
import { z } from "zod";
import { productConditionNameValidation, productConditionDescriptionValidation, productConditionEnumValidation } from "./../schemas/product-condition.schema.ts";
import type { IProductCondition } from "./../models/product-condition.model.ts";


const productConditionSchema = z.object({
    productConditionName: productConditionNameValidation,
    description: productConditionDescriptionValidation.nullish(),
    productConditionEnum: productConditionEnumValidation,
});

export type ProductCondition = z.infer<typeof productConditionSchema>;
export type ProductConditionDocument = IProductCondition;