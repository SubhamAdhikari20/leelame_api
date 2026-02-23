// src/dtos/bid.dto.ts
import { z } from "zod";
import { bidAmountValidation } from "./../schemas/bid.schema.ts";


// Create Bid DTO
export const CreateBidDto = z.object({
    productId: z.string(),
    buyerId: z.string(),
    bidAmount: bidAmountValidation
});
export type CreateBidDtoType = z.infer<typeof CreateBidDto>;

// Update Bid DTO
export const UpdateBidDto = z.object({
    productId: z.string(),
    buyerId: z.string(),
    bidAmount: bidAmountValidation
});
export type UpdateBidDtoType = z.infer<typeof UpdateBidDto>;


// Bid Response Dto
export const BidResponseDto = z.object({
    _id: z.string(),
    productId: z.string(),
    buyerId: z.string(),
    bidAmount: z.number(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type BidResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof BidResponseDto> | null;
};

export type AllBidsResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof BidResponseDto>[] | null;
};