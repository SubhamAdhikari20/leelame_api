// src/controllers/buyer.controller.ts
import type { Request, Response } from "express";
import { BuyerResponseDto, UpdateBuyerProfileDetailsDto, UploadImageBuyerResponseDto, UploadBuyerProfilePictureDto } from "./../dtos/buyer.dto.ts";
import { BuyerService } from "./../services/buyer.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class BuyerController {
    private buyerService: BuyerService;

    constructor(buyerService: BuyerService) {
        this.buyerService = buyerService;
    }

    getCurrentBuyer = asyncHandler(async (req: Request, res: Response) => {
        try {
            const buyerId = await req.params.id;
            if (!buyerId || buyerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token buyer id not found."
                });
            }

            if (buyerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.buyerService.getCurrentBuyerUser(buyerId.toString());

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

    updateBuyerProfileDetails = asyncHandler(async (req: Request, res: Response) => {
        try {
            const buyerId = await req.params.id;
            if (!buyerId || buyerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token buyer id not found."
                });
            }

            if (buyerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const body = await req.body;
            const validatedData = UpdateBuyerProfileDetailsDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.updateBuyerProfileDetails(buyerId.toString(), validatedData.data);
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
            console.error("Error updating buyer details in controller: ", error);

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
            const buyerId = await req.params.id;
            if (!buyerId || buyerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token buyer id not found."
                });
            }

            if (buyerId.toString() !== tokenUserId.toString()) {
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

            const validatedData = UploadBuyerProfilePictureDto.safeParse(file);
            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.uploadProfilePicture(buyerId.toString(), validatedData.data);
            const validatedResponseBuyerData = UploadImageBuyerResponseDto.safeParse(result?.data);
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
            console.error("Error uploading buyer profile picture in controller: ", error);

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

    deleteBuyerAccount = asyncHandler(async (req: Request, res: Response) => {
        try {
            const buyerId = await req.params.id;
            if (!buyerId || buyerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token buyer id not found."
                });
            }

            if (buyerId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.buyerService.deleteBuyerAccount(buyerId.toString());

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in deleting buyer account controller:", error);

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

    getBuyerByEmail = asyncHandler(async (req: Request, res: Response) => {
        try {
            const email = await req.params.email;
            if (!email || email.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer email is not sent through params."
                });
            }

            const tokenUserEmail = await req.user?.email;
            if (!tokenUserEmail || tokenUserEmail.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token buyer id not found."
                });
            }

            if (email.toString() !== tokenUserEmail.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.buyerService.getBuyerByEmail(email.toString());

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