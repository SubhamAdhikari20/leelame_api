// src/interfaces/seller.repository.interface.ts
import type { Seller, SellerDocument } from "./../types/seller.type.ts";


export interface SellerRepositoryInterface {
    createSeller(seller: Partial<Seller>): Promise<SellerDocument | null>;
    updateSeller(id: string, seller: Partial<Seller>): Promise<SellerDocument | null>;
    deleteSeller(id: string): Promise<void | null>;
    findSellerById(id: string): Promise<SellerDocument | null>;
    findSellerByBaseUserId(userId: string): Promise<SellerDocument | null>;
    findSellerByEmail(email: string): Promise<SellerDocument | null>;
    findSellerByContact(contact: string): Promise<SellerDocument | null>;
    getAllSellers(): Promise<SellerDocument[] | null>;
}