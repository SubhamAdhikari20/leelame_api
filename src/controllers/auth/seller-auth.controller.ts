// src/controllers/seller-auth.controller.ts
import type { Request, Response } from "express";
import { SellerResponseDto, CreatedSellerDto, ForgotPasswordDto, LoginSellerDto, ResetPasswordDto, SendEmailForRegistrationDto, VerifyOtpForRegistrationDto } from "../../dtos/seller.dto.ts";
import { SellerAuthService } from "./../../services/auth/seller-auth.service.ts";
import { z } from "zod";
import { HttpError } from "./../../errors/http-error.ts";
import asyncHandler from "./../../middleware/async.middleware.ts";


export class SellerAuthController {
    private sellerAuthService: SellerAuthService;

    constructor(sellerAuthService: SellerAuthService) {
        this.sellerAuthService = sellerAuthService;
    }

    createSeller = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = CreatedSellerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerAuthService.createSeller(validatedData.data);

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
                token: result?.token,
                user: validatedResponseSellerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in seller signup controller:", error);

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

    verifyOtpForRegistration = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = VerifyOtpForRegistrationDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerAuthService.verifyOtpForRegistration(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in seller verify otp for registration controller:", error);

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

    loginSeller = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = LoginSellerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerAuthService.loginSeller(validatedData.data);

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
                token: result?.token,
                user: validatedResponseSellerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in seller signup controller:", error);

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

    forgotPassword = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = ForgotPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerAuthService.forgotPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in seller forgot password controller:", error);

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

    resetPassword = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = ResetPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerAuthService.resetPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in seller reset password controller:", error);

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

    handleSendEmailForRegistration = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = SendEmailForRegistrationDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.sellerAuthService.handleSendEmailForRegistration(validatedData.data);

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
            console.error("Error in seller send verication email controller:", error);

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

    logoutSeller = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.sellerAuthService.logoutSeller();

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in seller logout controller:", error);

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