// src/controllers/seller.controller.ts
import type { Request, Response } from "express";
import { SellerResponseDto, UploadImageSellerResponseDto, UploadSellerProfilePictureDto, UpdateSellerProfileDetailsDto } from "./../dtos/seller.dto.ts";
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
            const sellerId = await req.params.id;
            if (!sellerId || sellerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token seller id not found."
                });
            }

            if (sellerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.sellerService.getCurrentSellerUser(sellerId.toString());

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

    updateSellerProfileDetails = asyncHandler(async (req: Request, res: Response) => {
        try {
            const sellerId = await req.params.id;
            if (!sellerId || sellerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token seller id not found."
                });
            }

            if (sellerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const body = await req.body;
            const validatedData = UpdateSellerProfileDetailsDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerService.updateSellerProfileDetails(sellerId.toString(), validatedData.data);
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
            console.error("Error updating seller details in controller: ", error);

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

    uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        try {
            const sellerId = await req.params.id;
            if (!sellerId || sellerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token seller id not found."
                });
            }

            if (sellerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const reqFile = await req.file;
            const file = {
                profilePicture: reqFile
            };

            // const file = {
            //     profilePicture: form.get("profile-picture")
            // };

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "No file provided!"
                });
            }

            const validatedData = UploadSellerProfilePictureDto.safeParse(file);
            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerService.uploadProfilePicture(sellerId.toString(), validatedData.data);
            const validatedResponseSellerData = UploadImageSellerResponseDto.safeParse(result?.data);
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
            console.error("Error uploading seller profile picture in controller: ", error);

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

    deleteSellerAccount = asyncHandler(async (req: Request, res: Response) => {
        try {
            const sellerId = await req.params.id;
            if (!sellerId || sellerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token seller id not found."
                });
            }

            if (sellerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.sellerService.deleteSellerAccount(sellerId.toString());

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in deleting seller account controller:", error);

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
            const email = await req.params.email;
            if (!email || email.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller email is not sent through params."
                });
            }

            const tokenUserEmail = await req.user?.email;
            if (!tokenUserEmail || tokenUserEmail.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token seller id not found."
                });
            }

            if (email.toString() !== tokenUserEmail.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.sellerService.getSellerByEmail(email.toString());

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