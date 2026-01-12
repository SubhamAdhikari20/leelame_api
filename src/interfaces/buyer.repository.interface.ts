// src/interfaces/buyer.repository.interface.ts
import { Buyer, BuyerDocument, ProviderBuyer } from "./../types/buyer.type.ts";


export interface BuyerRepositoryInterface {
    createBuyer(buyer: Buyer): Promise<BuyerDocument | null>;
    updateBuyer(id: string, buyer: Partial<Buyer>): Promise<BuyerDocument | null>;
    deleteBuyer(id: string): Promise<void | null>;
    findBuyerById(id: string): Promise<BuyerDocument | null>;
    findUserById(userId: string): Promise<BuyerDocument | null>;
    findBuyerByUsername(username: string): Promise<BuyerDocument | null>;
    findBuyerByContact(contact: string): Promise<BuyerDocument | null>;
    getAllBuyers(): Promise<BuyerDocument[] | null>;
    createGoogleProviderBuyer(buyer: ProviderBuyer): Promise<BuyerDocument | null>;
}