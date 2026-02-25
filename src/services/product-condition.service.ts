// src/services/product-condition.service.ts
import type { ProductConditionResponseDtoType, CreateProductConditionDtoType, UpdateProductConditionDtoType, AllProductConditionsResponseDtoType } from "./../dtos/product-condition.dto.ts";
import type { ProductConditionRepositoryInterface } from "./../interfaces/product-condition.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


export class ProductConditionService {
    private productConditionRepo: ProductConditionRepositoryInterface;

    constructor(productConditionRepo: ProductConditionRepositoryInterface) {
        this.productConditionRepo = productConditionRepo;
    }

    createProductCondition = async (createProductConditionData: CreateProductConditionDtoType): Promise<ProductConditionResponseDtoType> => {
        const { productConditionName, description, productConditionEnum } = createProductConditionData;

        const existingProductConditionByProductConditionName = await this.productConditionRepo.findProductConditionByProductConditionName(productConditionName);
        if (existingProductConditionByProductConditionName) {
            throw new HttpError(409, "Product condition already exists!");
        }

        const newProductCondition = await this.productConditionRepo.createProductCondition({
            productConditionName: productConditionName,
            description: description,
            productConditionEnum: productConditionEnum
        });

        if (!newProductCondition) {
            throw new HttpError(400, "Product condition is not created!");
        }

        const response: ProductConditionResponseDtoType = {
            success: true,
            message: "Product condition created successfully.",
            status: 201,
            data: {
                _id: newProductCondition._id.toString(),
                productConditionName: newProductCondition.productConditionName,
                description: newProductCondition.description,
                productConditionEnum: newProductCondition.productConditionEnum,
            }
        };
        return response;
    };

    updateProductCondition = async (productConditionId: string, updateProductConditionData: UpdateProductConditionDtoType): Promise<ProductConditionResponseDtoType> => {
        const { productConditionName, description, productConditionEnum } = updateProductConditionData;

        const decodedProductConditionId = decodeURIComponent(productConditionId);
        const existingProductConditionById = await this.productConditionRepo.findProductConditionById(decodedProductConditionId);
        if (!existingProductConditionById) {
            throw new HttpError(404, "Product condition with the productCondition id not found!");
        }

        const existingProductConditionByProductConditionName = await this.productConditionRepo.findProductConditionByProductConditionName(productConditionName);
        if (
            existingProductConditionByProductConditionName &&
            existingProductConditionByProductConditionName._id.toString() !== decodedProductConditionId
        ) {
            throw new HttpError(409, "Product condition already exists!");
        }

        const updateProductCondition = await this.productConditionRepo.updateProductCondition(existingProductConditionById._id.toString(), {
            productConditionName: productConditionName,
            description: description,
            productConditionEnum: productConditionEnum
        });

        if (!updateProductCondition) {
            throw new HttpError(400, "Product condition is not updated!");
        }

        const response: ProductConditionResponseDtoType = {
            success: true,
            message: "Product condition updated successfully.",
            status: 200,
            data: {
                _id: updateProductCondition._id.toString(),
                productConditionName: updateProductCondition.productConditionName,
                description: updateProductCondition.description,
                productConditionEnum: updateProductCondition.productConditionEnum,
            }
        };
        return response;
    };

    deleteProductCondition = async (productConditionId: string): Promise<ProductConditionResponseDtoType> => {
        const decodedProductConditionId = decodeURIComponent(productConditionId);
        const deletedProductCondition = await this.productConditionRepo.deleteProductCondition(decodedProductConditionId);
        if (!deletedProductCondition) {
            throw new HttpError(400, "Product condition is not deleted!");
        }

        const response: ProductConditionResponseDtoType = {
            success: true,
            message: "Product condition deleted successfully.",
            status: 200
        };
        return response;
    };

    getProductConditionById = async (productConditionId: string): Promise<ProductConditionResponseDtoType> => {
        const decodedProductConditionId = decodeURIComponent(productConditionId);
        const existingProductConditionById = await this.productConditionRepo.findProductConditionById(decodedProductConditionId);
        if (!existingProductConditionById) {
            throw new HttpError(404, "Product condition with this id not found!");
        }

        const response: ProductConditionResponseDtoType = {
            success: true,
            message: "Product condition profile details updated successfully.",
            status: 200,
            data: {
                _id: existingProductConditionById._id.toString(),
                productConditionName: existingProductConditionById.productConditionName,
                description: existingProductConditionById.description,
                productConditionEnum: existingProductConditionById.productConditionEnum,
            }
        };
        return response;
    };

    getAllProductConditions = async (): Promise<AllProductConditionsResponseDtoType> => {
        const allProductConditions = await this.productConditionRepo.getAllProductConditions();
        if (!allProductConditions) {
            throw new HttpError(404, "Product conditions could not be fetched!");
        }

        const productConditions = await Promise.all(
            allProductConditions.map(async (productCondition) => {
                return {
                    _id: productCondition._id.toString(),
                    productConditionName: productCondition.productConditionName,
                    description: productCondition.description,
                    productConditionEnum: productCondition.productConditionEnum,
                };
            })
        );

        const response: AllProductConditionsResponseDtoType = {
            success: true,
            message: "All product conditions fetched successfully.",
            status: 200,
            data: productConditions
        };
        return response;
    };
}