// src/repositories/bid.repository.ts
import type { BidRepositoryInterface } from "./../interfaces/bid.repository.interface.ts";
import type { Bid, BidDocument } from "./../types/bid.type.ts";
import BidModel from "./../models/bid.model.ts";
import ProductModel from "./../models/product.model.ts";


export class BidRepository implements BidRepositoryInterface {
    createBid = async (bid: Partial<Bid>): Promise<BidDocument | null> => {
        const newBid = await BidModel.create(bid);
        return newBid;
    };

    updateBid = async (id: string, bid: Partial<Bid>): Promise<BidDocument | null> => {
        const updatedBid = await BidModel.findByIdAndUpdate(id, bid, { new: true }).lean();
        return updatedBid;
    };

    deleteBid = async (id: string): Promise<boolean> => {
        const deletedBid = await BidModel.findByIdAndDelete(id);
        if (!deletedBid) {
            return false;
        }
        return true;
    };

    findBidById = async (id: string): Promise<BidDocument | null> => {
        const bid = await BidModel.findById(id).lean();
        return bid;
    };

    findBidByProductId = async (productId: string): Promise<BidDocument | null> => {
        const bid = await BidModel.findOne({ productId: productId }).lean();
        return bid;
    };

    findBidByBuyerId = async (buyerId: string): Promise<BidDocument | null> => {
        const bid = await BidModel.findOne({ buyerId: buyerId }).lean();
        return bid;
    };

    findBidBySellerId = async (sellerId: string): Promise<BidDocument | null> => {
        const product = await ProductModel.findOne({ sellerId: sellerId }).lean();
        if (!product) {
            return null;
        }

        const bid = await BidModel.findOne({ productId: product._id.toString() }).lean();
        return bid;
    };

    findAllBidsByProductId = async (productId: string): Promise<BidDocument[] | null> => {
        const bids = await BidModel.find({ productId: productId }).lean();
        return bids;
    };

    findAllBidsByBuyerId = async (buyerId: string): Promise<BidDocument[] | null> => {
        const bids = await BidModel.find({ buyerId: buyerId }).lean();
        return bids;
    };

    findAllBidsBySellerId = async (sellerId: string): Promise<BidDocument[] | null> => {
        const products = await ProductModel.find({ sellerId: sellerId }).lean();
        if (!products || products.length === 0) {
            return null;
        }

        const productIds = products.map((product) => product._id.toString());
        const bids = await BidModel.find({ productId: { $in: productIds } }).lean();
        return bids;
    };

    getAllBids = async (): Promise<BidDocument[] | null> => {
        const bids = await BidModel.find().lean();
        return bids;
    };
}