// src/interfaces/product.repository.interface.ts
import type { ProductDocument, Product } from "./../types/product.type.ts";


export interface ProductRepositoryInterface {
    createProduct(product: Partial<Product>): Promise<ProductDocument | null>;
    updateProduct(id: string, product: Partial<Product>): Promise<ProductDocument | null>;
    deleteProduct(id: string): Promise<boolean>;
    findProductById(id: string): Promise<ProductDocument | null>;
    findProductBySellerId(sellerId: string): Promise<ProductDocument | null>;
    findProductByBuyerId(buyerId: string): Promise<ProductDocument | null>;
    getAllProducts(): Promise<ProductDocument[] | null>;
}