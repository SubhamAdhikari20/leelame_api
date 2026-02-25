// src/controllers/bid.controller.ts
import type { Request, Response } from "express";
import { BidResponseDto, CreateBidDto, UpdateBidDto } from "./../dtos/bid.dto.ts";
import { BidService } from "./../services/bid.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class BidController {
    private bidService: BidService;

    constructor(bidService: BidService) {
        this.bidService = bidService;
    }

    createBid = asyncHandler(async (req: Request, res: Response) => {
        try {
            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const validatedData = CreateBidDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.bidService.createBid(validatedData.data);

            const validatedResponseBidData = CreateBidDto.safeParse(result?.data);
            if (!validatedResponseBidData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseBidData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseBidData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    updateBid = asyncHandler(async (req: Request, res: Response) => {
        try {
            const bidId = await req.params.id;
            if (!bidId || bidId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Bid id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const body = await req.body;
            const validatedData = UpdateBidDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.bidService.updateBid(bidId.toString(), validatedData.data);
            const validatedResponseBidData = BidResponseDto.safeParse(result?.data);
            if (!validatedResponseBidData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseBidData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseBidData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    deleteBid = asyncHandler(async (req: Request, res: Response) => {
        try {
            const bidId = await req.params.id;
            if (!bidId || bidId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Bid id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.bidService.deleteBid(bidId.toString());

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    getBidById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const bidId = await req.params.id;
            if (!bidId || bidId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Bid id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.bidService.getBidById(bidId.toString());

            const validatedResponseBidData = BidResponseDto.safeParse(result?.data);
            if (!validatedResponseBidData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseBidData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseBidData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    getAllBids = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.bidService.getAllBids();

            const validatedBidsData = z.array(BidResponseDto).safeParse(result?.data);
            if (!validatedBidsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedBidsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedBidsData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    findAllBidsByProductId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productId = await req.params.productId;
            if (!productId || productId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product id is not sent through params."
                });
            }

            const result = await this.bidService.findAllBidsByProductId(productId.toString());

            const validatedBidsData = z.array(BidResponseDto).safeParse(result?.data);
            if (!validatedBidsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedBidsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedBidsData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    findAllBidsByBuyerId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const buyerId = await req.params.buyerId;
            if (!buyerId || buyerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            // if (buyerId.toString() !== tokenUserId.toString()) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Params user id and token id mismatch!"
            //     });
            // }

            const result = await this.bidService.findAllBidsByBuyerId(buyerId.toString());

            const validatedBidsData = z.array(BidResponseDto).safeParse(result?.data);
            if (!validatedBidsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedBidsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedBidsData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });

    findAllBidsBySellerId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const sellerId = await req.params.sellerId;
            if (!sellerId || sellerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            // if (sellerId.toString() !== tokenUserId.toString()) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Params user id and token id mismatch!"
            //     });
            // }

            const result = await this.bidService.findAllBidsBySellerId(sellerId.toString());

            const validatedBidsData = z.array(BidResponseDto).safeParse(result?.data);
            if (!validatedBidsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedBidsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedBidsData.data,
            });
        }
        catch (error: Error | any) {
            if (error instanceof HttpError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    });
}