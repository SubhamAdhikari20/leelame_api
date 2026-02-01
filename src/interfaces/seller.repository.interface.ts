// src/interfaces/seller.repository.interface.ts
import type { Seller, SellerDocument } from "./../types/seller.type.ts";
import type { ClientSession } from "mongoose";


export interface SellerRepositoryInterface {
    createSeller(seller: Partial<Seller>, options?: { session?: ClientSession | null }): Promise<SellerDocument | null>;
    updateSeller(id: string, seller: Partial<Seller>, options?: { session?: ClientSession | null }): Promise<SellerDocument | null>;
    deleteSeller(id: string, options?: { session?: ClientSession | null }): Promise<Boolean>;
    findSellerById(id: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null>;
    findSellerByBaseUserId(baseUserId: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null>;
    findSellerByEmail(email: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null>;
    findSellerByContact(contact: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null>;
    getAllSellers(options?: { session?: ClientSession | null }): Promise<SellerDocument[] | null>;
}