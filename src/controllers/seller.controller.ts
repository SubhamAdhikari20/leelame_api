// src/controllers/seller.controller.ts
import type { Request, Response } from "express";
import { SellerResponseDto, GetSellerByEmailDto, GetSellerByIdDto, GetCurrentSellerDto } from "./../dtos/seller.dto.ts";
import { SellerService } from "./../services/seller.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class SellerController {
    private sellerService: SellerService;

    constructor(sellerService: SellerService) {
        this.sellerService = sellerService;
    }

    getCurrentSeller = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.params;
            const validatedData = GetCurrentSellerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerService.getCurrentSellerUser(validatedData.data);

            const validatedResponseSellerData = SellerResponseDto.safeParse(result?.user);
            if (!validatedResponseSellerData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseSellerData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                user: validatedResponseSellerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in fetching seller data controller:", error);

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

    getSellerByEmail = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.params;
            const validatedData = GetSellerByEmailDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerService.getSellerByEmail(validatedData.data);

            const validatedResponseSellerData = SellerResponseDto.safeParse(result?.user);
            if (!validatedResponseSellerData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseSellerData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                user: validatedResponseSellerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in fetching seller data controller:", error);

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

    getSellerById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.params;
            const validatedData = GetSellerByIdDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerService.getSellerById(validatedData.data);

            const validatedResponseSellerData = SellerResponseDto.safeParse(result?.user);
            if (!validatedResponseSellerData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseSellerData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                user: validatedResponseSellerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in fetching seller data controller:", error);

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