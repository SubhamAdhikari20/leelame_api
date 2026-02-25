// src/services/bid.service.ts
import type { BidResponseDtoType, CreateBidDtoType, UpdateBidDtoType, AllBidsResponseDtoType } from "./../dtos/bid.dto.ts";
import type { BidRepositoryInterface } from "./../interfaces/bid.repository.interface.ts";
import type { ProductRepositoryInterface } from "./../interfaces/product.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


export class BidService {
    private bidRepo: BidRepositoryInterface;
    private productRepo: ProductRepositoryInterface;

    constructor(bidRepo: BidRepositoryInterface, productRepo: ProductRepositoryInterface) {
        this.bidRepo = bidRepo;
        this.productRepo = productRepo;
    }

    createBid = async (createBidData: CreateBidDtoType): Promise<BidResponseDtoType> => {
        const { productId, buyerId, bidAmount } = createBidData;

        const exisitingProductById = await this.productRepo.findProductById(productId);
        if (!exisitingProductById) {
            throw new HttpError(401, "Product with this id not found!");
        }

        const minRequiredBidAmount = exisitingProductById.currentBidPrice + exisitingProductById.bidIntervalPrice;
        if (bidAmount < minRequiredBidAmount) {
            throw new HttpError(
                400,
                `Your bid must be greater than or equal to the sum of current bid and bid interval price (Rs.${minRequiredBidAmount.toFixed(2)})`
            );
        }

        const endDate = new Date(exisitingProductById.endDate).getTime();
        const now = new Date().getTime();
        const difference = endDate - now;

        if (difference <= 0) {
            throw new HttpError(400, "Auction has already ended for this product!");
        }

        const newBid = await this.bidRepo.createBid({
            productId: productId,
            buyerId: buyerId,
            bidAmount: bidAmount
        });

        if (!newBid) {
            throw new HttpError(400, "Bid is not created!");
        }

        const updatedProductDetails = await this.productRepo.updateProduct(productId.toString(), {
            currentBidPrice: bidAmount
        });

        if (!updatedProductDetails) {
            throw new HttpError(400, "Current bid price of the product is not updated!");
        }

        const response: BidResponseDtoType = {
            success: true,
            message: "Bid placed successfully.",
            status: 201,
            data: {
                _id: newBid._id.toString(),
                productId: newBid.productId.toString(),
                buyerId: newBid.buyerId.toString(),
                bidAmount: newBid.bidAmount
            }
        };
        return response;
    };

    updateBid = async (bidId: string, updateBidData: UpdateBidDtoType): Promise<BidResponseDtoType> => {
        const { productId, buyerId, bidAmount } = updateBidData;

        const decodedBidId = decodeURIComponent(bidId);
        const existingBidById = await this.bidRepo.findBidById(decodedBidId);
        if (!existingBidById) {
            throw new HttpError(404, "Bid with the bid id not found!");
        }

        const exisitingProductById = await this.productRepo.findProductById(productId);
        if (!exisitingProductById) {
            throw new HttpError(401, "Product with this id not found!");
        }

        const minRequiredBidAmount = exisitingProductById.currentBidPrice + exisitingProductById.bidIntervalPrice;
        if (bidAmount < minRequiredBidAmount) {
            throw new HttpError(
                400,
                `Your bid must be greater than or equal to the sum of current bid and bid interval price (Rs.${minRequiredBidAmount.toFixed(2)})`
            );
        }

        const endDate = new Date(exisitingProductById.endDate).getTime();
        const now = new Date().getTime();
        const difference = endDate - now;

        if (difference <= 0) {
            throw new HttpError(400, "Auction has already ended for this product!");
        }

        const updateBid = await this.bidRepo.updateBid(existingBidById._id.toString(), {
            productId: productId,
            buyerId: buyerId,
            bidAmount: bidAmount
        });

        if (!updateBid) {
            throw new HttpError(400, "Bid is not updated!");
        }

        const response: BidResponseDtoType = {
            success: true,
            message: "Bid updated successfully.",
            status: 200,
            data: {
                _id: updateBid._id.toString(),
                productId: updateBid.productId.toString(),
                buyerId: updateBid.buyerId.toString(),
                bidAmount: updateBid.bidAmount
            }
        };
        return response;
    };

    deleteBid = async (bidId: string): Promise<BidResponseDtoType> => {
        const decodedBidId = decodeURIComponent(bidId);
        const deletedBid = await this.bidRepo.deleteBid(decodedBidId);
        if (!deletedBid) {
            throw new HttpError(400, "Bid is not deleted!");
        }

        const response: BidResponseDtoType = {
            success: true,
            message: "Bid deleted successfully.",
            status: 200
        };
        return response;
    };

    getBidById = async (bidId: string): Promise<BidResponseDtoType> => {
        const decodedBidId = decodeURIComponent(bidId);
        const existingBidById = await this.bidRepo.findBidById(decodedBidId);
        if (!existingBidById) {
            throw new HttpError(404, "Bid with this id not found!");
        }

        const response: BidResponseDtoType = {
            success: true,
            message: "Bid details updated successfully.",
            status: 200,
            data: {
                _id: existingBidById._id.toString(),
                productId: existingBidById.productId.toString(),
                buyerId: existingBidById.buyerId.toString(),
                bidAmount: existingBidById.bidAmount
            }
        };
        return response;
    };

    getAllBids = async (): Promise<AllBidsResponseDtoType> => {
        const allBids = await this.bidRepo.getAllBids();
        if (!allBids) {
            throw new HttpError(404, "Bids could not be fetched!");
        }

        const bids = await Promise.all(
            allBids.map(async (bid) => {
                return {
                    _id: bid._id.toString(),
                    productId: bid.productId.toString(),
                    buyerId: bid.buyerId.toString(),
                    bidAmount: bid.bidAmount
                };
            })
        );

        const response: AllBidsResponseDtoType = {
            success: true,
            message: "All bids fetched successfully.",
            status: 200,
            data: bids
        };
        return response;
    };

    findAllBidsByProductId = async (productId: string): Promise<AllBidsResponseDtoType> => {
        const allBidsByProductId = await this.bidRepo.findAllBidsByProductId(productId);
        if (!allBidsByProductId) {
            throw new HttpError(404, "Bids could not be fetched with this product id!");
        }

        const bids = await Promise.all(
            allBidsByProductId.map(async (bid) => {
                return {
                    _id: bid._id.toString(),
                    productId: bid.productId.toString(),
                    buyerId: bid.buyerId.toString(),
                    bidAmount: bid.bidAmount
                };
            })
        );

        const response: AllBidsResponseDtoType = {
            success: true,
            message: "All bids with this product id fetched successfully.",
            status: 200,
            data: bids
        };
        return response;
    };

    findAllBidsByBuyerId = async (buyerId: string): Promise<AllBidsResponseDtoType> => {
        const allBidsByBuyerId = await this.bidRepo.findAllBidsByBuyerId(buyerId);
        if (!allBidsByBuyerId) {
            throw new HttpError(404, "Bids could not be fetched with this buyer id!");
        }

        const bids = await Promise.all(
            allBidsByBuyerId.map(async (bid) => {
                return {
                    _id: bid._id.toString(),
                    productId: bid.productId.toString(),
                    buyerId: bid.buyerId.toString(),
                    bidAmount: bid.bidAmount
                };
            })
        );

        const response: AllBidsResponseDtoType = {
            success: true,
            message: "All bids with this buyer id fetched successfully.",
            status: 200,
            data: bids
        };
        return response;
    };

    findAllBidsBySellerId = async (sellerId: string): Promise<AllBidsResponseDtoType> => {
        const allBidsBySellerId = await this.bidRepo.findAllBidsBySellerId(sellerId);
        if (!allBidsBySellerId) {
            throw new HttpError(404, "Bids could not be fetched with this seller id!");
        }

        const bids = await Promise.all(
            allBidsBySellerId.map(async (bid) => {
                return {
                    _id: bid._id.toString(),
                    productId: bid.productId.toString(),
                    buyerId: bid.buyerId.toString(),
                    bidAmount: bid.bidAmount
                };
            })
        );

        const response: AllBidsResponseDtoType = {
            success: true,
            message: "All bids with this seller id fetched successfully.",
            status: 200,
            data: bids
        };
        return response;
    };
}