// src/controllers/buyer.controller.ts
import type { Request, Response } from "express";
import { BuyerResponseDto, GetBuyerByEmailDto, GetBuyerByIdDto } from "./../dtos/buyer.dto.ts";
import { BuyerService } from "./../services/buyer.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class BuyerController {
    private buyerService: BuyerService;

    constructor(buyerService: BuyerService) {
        this.buyerService = buyerService;
    }

    getBuyerByEmail = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.params;
            const validatedData = GetBuyerByEmailDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.getBuyerByEmail(validatedData.data);

            const validatedResponseBuyerData = BuyerResponseDto.safeParse(result?.user);
            if (!validatedResponseBuyerData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseBuyerData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                user: validatedResponseBuyerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in fetching buyer data controller:", error);

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

    getBuyerById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.params;
            const validatedData = GetBuyerByIdDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.getBuyerById(validatedData.data);

            const validatedResponseBuyerData = BuyerResponseDto.safeParse(result?.user);
            if (!validatedResponseBuyerData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseBuyerData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                user: validatedResponseBuyerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in fetching buyer data controller:", error);

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