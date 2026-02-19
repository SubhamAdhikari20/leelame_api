// src/interfaces/product-condition.repository.interface.ts
import type { ProductConditionDocument, ProductCondition } from "./../types/product-condition.type.ts";


export interface ProductConditionRepositoryInterface {
    createProductCondition(productCondition: ProductCondition): Promise<ProductConditionDocument | null>;
    updateProductCondition(id: string, productCondition: Partial<ProductCondition>): Promise<ProductConditionDocument | null>;
    deleteProductCondition(id: string): Promise<boolean>;
    findProductConditionById(id: string): Promise<ProductConditionDocument | null>;
    findProductConditionByProductConditionName(productConditionName: string): Promise<ProductConditionDocument | null>;
    getAllProductConditions(): Promise<ProductConditionDocument[] | null>;
}