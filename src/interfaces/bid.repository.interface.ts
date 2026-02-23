// src/interfaces/bid.repository.interface.ts
import type { BidDocument, Bid } from "./../types/bid.type.ts";


export interface BidRepositoryInterface {
    createBid(bid: Partial<Bid>): Promise<BidDocument | null>;
    updateBid(id: string, bid: Partial<Bid>): Promise<BidDocument | null>;
    deleteBid(id: string): Promise<boolean>;
    findBidById(id: string): Promise<BidDocument | null>;
    findBidByProductId(productId: string): Promise<BidDocument | null>;
    findBidByBuyerId(buyerId: string): Promise<BidDocument | null>;
    findBidBySellerId(sellerId: string): Promise<BidDocument | null>;
    findAllBidsByProductId(productId: string): Promise<BidDocument[] | null>;
    findAllBidsByBuyerId(buyerId: string): Promise<BidDocument[] | null>;
    findAllBidsBySellerId(sellerId: string): Promise<BidDocument[] | null>;
    getAllBids(): Promise<BidDocument[] | null>;
}