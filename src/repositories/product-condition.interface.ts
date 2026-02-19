// src/repositories/product-condition.repository.ts
import type { ProductConditionRepositoryInterface } from "./../interfaces/product-condition.repository.interface.ts";
import type { ProductCondition, ProductConditionDocument } from "./../types/product-condition.type.ts";
import ProductConditionModel from "./../models/product-condition.model.ts";


export class ProductConditionRepository implements ProductConditionRepositoryInterface {
    createProductCondition = async (productCondition: ProductCondition): Promise<ProductConditionDocument | null> => {
        const newProductCondition = await ProductConditionModel.create(productCondition);
        return newProductCondition;
    };

    updateProductCondition = async (id: string, productCondition: Partial<ProductCondition>): Promise<ProductConditionDocument | null> => {
        const updatedProductCondition = await ProductConditionModel.findByIdAndUpdate(id, productCondition, { new: true }).lean();
        return updatedProductCondition;
    };

    deleteProductCondition = async (id: string): Promise<boolean> => {
        const deletedProductCondition = await ProductConditionModel.findByIdAndDelete(id);
        if (!deletedProductCondition) {
            return false;
        }
        return true;
    };

    findProductConditionById = async (id: string): Promise<ProductConditionDocument | null> => {
        const productCondition = await ProductConditionModel.findById(id).lean();
        return productCondition;
    };

    findProductConditionByProductConditionName = async (productConditionName: string): Promise<ProductConditionDocument | null> => {
        const productCondition = await ProductConditionModel.findOne({ productConditionName }).lean();
        return productCondition;
    };

    getAllProductConditions = async (): Promise<ProductConditionDocument[] | null> => {
        const categories = await ProductConditionModel.find().lean();
        return categories;
    };
}