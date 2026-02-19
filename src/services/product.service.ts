// src/services/product.service.ts
import type { ProductResponseDtoType, CreateProductDtoType, UpdateProductDtoType, AllProductsResponseDtoType } from "./../dtos/product.dto.ts";
import type { ProductRepositoryInterface } from "./../interfaces/product.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { processDeleteUpload, processMultipleUploads } from "./../utils/upload-media.util.ts";


export class ProductService {
    private productRepo: ProductRepositoryInterface;

    constructor(productRepo: ProductRepositoryInterface) {
        this.productRepo = productRepo;
    }

    createProduct = async (sellerId: string, createProductData: CreateProductDtoType, productImages?: Express.Multer.File[], imageSubFolder?: string): Promise<ProductResponseDtoType> => {
        let productImageUrls: string[] | undefined;
        if (productImages && productImages.length > 0) {
            for (const file of productImages) {
                if (!file.mimetype?.startsWith("image/")) {
                    throw new HttpError(400, "Only image files are allowed!");
                }
            }

            productImageUrls = await processMultipleUploads(
                productImages,
                imageSubFolder || "product-images"
            );
        }

        const { productName, description, startPrice, bidIntervalPrice, endDate, categoryId, conditionId } = createProductData;

        const createProductPayload: any = {
            productName: productName,
            description: description,
            startPrice: startPrice,
            currentBidPrice: startPrice,
            bidIntervalPrice: bidIntervalPrice,
            endDate: endDate,
            sellerId: sellerId,
            categoryId: categoryId,
            conditionId: conditionId
        };

        if (productImageUrls && productImageUrls.length > 0) {
            createProductPayload.productImageUrls = productImageUrls;
        }

        const newProduct = await this.productRepo.createProduct(createProductPayload);
        if (!newProduct) {
            if (productImageUrls && productImageUrls.length > 0) {
                await Promise.all(
                    productImageUrls.map(productImageUrl => processDeleteUpload(productImageUrl))
                );
            }
            throw new HttpError(400, "Product is not created!");
        }

        const respose: ProductResponseDtoType = {
            success: true,
            message: "Product created successfully.",
            status: 201,
            data: {
                _id: newProduct._id.toString(),
                productName: newProduct.productName,
                description: newProduct.description,
                commission: newProduct.commission,
                startPrice: newProduct.startPrice,
                currentBidPrice: newProduct.currentBidPrice,
                bidIntervalPrice: newProduct.bidIntervalPrice,
                productImageUrls: newProduct.productImageUrls,
                endDate: newProduct.endDate,
                isVerified: newProduct.isVerified,
                isSoldOut: newProduct.isSoldOut,
                sellerId: newProduct.sellerId.toString(),
                categoryId: newProduct.categoryId.toString(),
                conditionId: newProduct.conditionId.toString(),
                soldToBuyerId: newProduct.soldToBuyerId?.toString(),
                createdAt: newProduct.createdAt,
                updatedAt: newProduct.updatedAt,
            }
        };
        return respose;
    };

    updateProduct = async (productId: string, updateProductData: UpdateProductDtoType, productImages?: Express.Multer.File[], imageSubFolder?: string): Promise<ProductResponseDtoType> => {
        let newProductImageUrls: string[] | undefined;
        if (productImages && productImages.length > 0) {
            for (const file of productImages) {
                if (!file.mimetype?.startsWith("image/")) {
                    throw new HttpError(400, "Only image files are allowed!");
                }
            }

            newProductImageUrls = await processMultipleUploads(
                productImages,
                imageSubFolder || "product-images"
            );
        }

        const { productName, description, startPrice, bidIntervalPrice, endDate, categoryId, conditionId, removedExisitingProductImageUrls } = updateProductData;

        const decodedProductId = decodeURIComponent(productId);
        const existingProductById = await this.productRepo.findProductById(decodedProductId);
        if (!existingProductById) {
            throw new HttpError(404, "Product with the product id not found!");
        }

        const updateProductDetailsPayload: any = {
            productName: productName,
            description: description,
            startPrice: startPrice,
            bidIntervalPrice: bidIntervalPrice,
            endDate: endDate,
            categoryId: categoryId,
            conditionId: conditionId
        };

        let finalProductImageUrls = [...(existingProductById.productImageUrls || [])];
        // Remove deleted images
        if (removedExisitingProductImageUrls && removedExisitingProductImageUrls.length > 0) {
            finalProductImageUrls = finalProductImageUrls.filter(imageUrl => !removedExisitingProductImageUrls.includes(imageUrl));
            await Promise.all(removedExisitingProductImageUrls.map(imageUrl => processDeleteUpload(imageUrl)));
        }

        if (newProductImageUrls && (newProductImageUrls.length > 0)) {
            finalProductImageUrls = [...finalProductImageUrls, ...newProductImageUrls];
        }

        updateProductDetailsPayload.productImageUrls = finalProductImageUrls;

        const updatedProduct = await this.productRepo.updateProduct(existingProductById._id.toString(), updateProductDetailsPayload);
        if (!updatedProduct) {
            if (newProductImageUrls && (newProductImageUrls.length > 0)) {
                await Promise.all(
                    newProductImageUrls.map(newProductImageUrl => processDeleteUpload(newProductImageUrl))
                );
            }

            throw new HttpError(400, "Product is not updated!");
        }

        const respose: ProductResponseDtoType = {
            success: true,
            message: "Product updated successfully.",
            status: 200,
            data: {
                _id: updatedProduct._id.toString(),
                productName: updatedProduct.productName,
                description: updatedProduct.description,
                commission: updatedProduct.commission,
                startPrice: updatedProduct.startPrice,
                currentBidPrice: updatedProduct.currentBidPrice,
                bidIntervalPrice: updatedProduct.bidIntervalPrice,
                productImageUrls: updatedProduct.productImageUrls,
                endDate: updatedProduct.endDate,
                isVerified: updatedProduct.isVerified,
                isSoldOut: updatedProduct.isSoldOut,
                sellerId: updatedProduct.sellerId.toString(),
                categoryId: updatedProduct.categoryId.toString(),
                conditionId: updatedProduct.conditionId.toString(),
                soldToBuyerId: updatedProduct.soldToBuyerId?.toString(),
                createdAt: updatedProduct.createdAt,
                updatedAt: updatedProduct.updatedAt,
            }
        };
        return respose;
    };

    deleteProduct = async (productId: string): Promise<ProductResponseDtoType> => {
        const decodedProductId = decodeURIComponent(productId);
        const deletedProduct = await this.productRepo.deleteProduct(decodedProductId);
        if (!deletedProduct) {
            throw new HttpError(400, "Product is not deleted!");
        }

        const response: ProductResponseDtoType = {
            success: true,
            message: "Product deleted successfully.",
            status: 200
        };
        return response;
    };

    getProductById = async (productId: string): Promise<ProductResponseDtoType> => {
        const decodedProductId = decodeURIComponent(productId);
        const existingProductById = await this.productRepo.findProductById(decodedProductId);
        if (!existingProductById) {
            throw new HttpError(404, "Product with this id not found!");
        }

        const response: ProductResponseDtoType = {
            success: true,
            message: "Product profile details updated successfully.",
            status: 200,
            data: {
                _id: existingProductById._id.toString(),
                productName: existingProductById.productName,
                description: existingProductById.description,
                commission: existingProductById.commission,
                startPrice: existingProductById.startPrice,
                currentBidPrice: existingProductById.currentBidPrice,
                bidIntervalPrice: existingProductById.bidIntervalPrice,
                productImageUrls: existingProductById.productImageUrls,
                endDate: existingProductById.endDate,
                isVerified: existingProductById.isVerified,
                isSoldOut: existingProductById.isSoldOut,
                sellerId: existingProductById.sellerId.toString(),
                categoryId: existingProductById.categoryId.toString(),
                conditionId: existingProductById.conditionId.toString(),
                soldToBuyerId: existingProductById.soldToBuyerId?.toString(),
                createdAt: existingProductById.createdAt,
                updatedAt: existingProductById.updatedAt,
            }
        };
        return response;
    };

    getAllProducts = async (): Promise<AllProductsResponseDtoType> => {
        const allProducts = await this.productRepo.getAllProducts();
        if (!allProducts) {
            throw new HttpError(404, "Products could not be fetched!");
        }

        const products = await Promise.all(
            allProducts.map(async (product) => {
                return {
                    _id: product._id.toString(),
                    productName: product.productName,
                    description: product.description,
                    commission: product.commission,
                    startPrice: product.startPrice,
                    currentBidPrice: product.currentBidPrice,
                    bidIntervalPrice: product.bidIntervalPrice,
                    productImageUrls: product.productImageUrls,
                    endDate: product.endDate,
                    isVerified: product.isVerified,
                    isSoldOut: product.isSoldOut,
                    sellerId: product.sellerId.toString(),
                    categoryId: product.categoryId.toString(),
                    conditionId: product.conditionId.toString(),
                    soldToBuyerId: product.soldToBuyerId?.toString(),
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                };
            })
        );

        const respose: AllProductsResponseDtoType = {
            success: true,
            message: "All products fetched successfully.",
            status: 200,
            data: products
        };
        return respose;
    };
}