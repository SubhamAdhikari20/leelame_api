// src/interfaces/buyer.repository.interface.ts
import type { Buyer, BuyerDocument, ProviderBuyer } from "./../types/buyer.type.ts";
import type { ClientSession } from "mongoose";


export interface BuyerRepositoryInterface {
    createBuyer(buyer: Buyer, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    updateBuyer(id: string, buyer: Partial<Buyer>, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    deleteBuyer(id: string, options?: { session?: ClientSession | null }): Promise<Boolean>;
    findBuyerById(id: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    findBuyerByBaseUserId(baseUserId: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    findBuyerByEmail(email: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    findBuyerByUsername(username: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    findBuyerByContact(contact: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
    getAllBuyers(options?: { session?: ClientSession | null }): Promise<BuyerDocument[] | null>;
    createGoogleProviderBuyer(buyer: ProviderBuyer, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null>;
}