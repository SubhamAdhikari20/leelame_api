// src/repositories/product.repository.ts
import type { ProductRepositoryInterface } from "./../interfaces/product.repository.interface.ts";
import type { Product, ProductDocument, VerifyAndSetCommissionForProductByAdmin } from "./../types/product.type.ts";
import ProductModel from "./../models/product.model.ts";


export class ProductRepository implements ProductRepositoryInterface {
    createProduct = async (product: Partial<Product>): Promise<ProductDocument | null> => {
        const newProduct = await ProductModel.create(product);
        return newProduct;
    };

    updateProduct = async (id: string, product: Partial<Product>): Promise<ProductDocument | null> => {
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, product, { new: true }).lean();
        return updatedProduct;
    };

    deleteProduct = async (id: string): Promise<boolean> => {
        const deletedProduct = await ProductModel.findByIdAndDelete(id);
        if (!deletedProduct) {
            return false;
        }
        return true;
    };

    findProductById = async (id: string): Promise<ProductDocument | null> => {
        const product = await ProductModel.findById(id).lean();
        return product;
    };

    findProductBySellerId = async (sellerId: string): Promise<ProductDocument | null> => {
        const product = await ProductModel.findOne({ sellerId: sellerId }).lean();
        return product;
    };

    findProductByBuyerId = async (buyerId: string): Promise<ProductDocument | null> => {
        const product = await ProductModel.findOne({ soldToBuyerId: buyerId }).lean();
        return product;
    };

    findAllProductsBySellerId = async (sellerId: string): Promise<ProductDocument[] | null> => {
        const products = await ProductModel.find({ sellerId: sellerId }).lean();
        return products;
    };

    findAllProductsByBuyerId = async (buyerId: string): Promise<ProductDocument[] | null> => {
        const products = await ProductModel.find({ soldToBuyerId: buyerId, isVerified: true }).lean();
        return products;
    };

    getAllProducts = async (): Promise<ProductDocument[] | null> => {
        const products = await ProductModel.find().lean();
        return products;
    };

    getAllVerifiedProducts = async (): Promise<ProductDocument[] | null> => {
        const verifiedProducts = await ProductModel.find({ isVerified: true }).lean();
        return verifiedProducts;
    };

    verifyAndSetCommissionForProductByAdmin = async (id: string, data: Partial<VerifyAndSetCommissionForProductByAdmin>): Promise<ProductDocument | null> => {
        const verifiedProduct = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
        return verifiedProduct;
    };

    // verifyProductByAdmin = async (id: string): Promise<ProductDocument | null> => {
    //     const verifiedProduct = await ProductModel.findByIdAndUpdate(id, { isVerified: true }, { new: true }).lean();
    //     return verifiedProduct;
    // };
}