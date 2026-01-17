// src/controllers/buyer-auth.controller.ts
import type { Request, Response } from "express";
import { BuyerResponseDto, CheckUsernameUniqueDto, CreatedBuyerDto, ForgotPasswordDto, LoginBuyerDto, ResetPasswordDto, SendEmailForRegistrationDto, VerifyOtpForRegistrationDto, VerifyOtpForResetPasswordDto } from "../../dtos/buyer.dto.ts";
import { BuyerAuthService } from "../../services/auth/buyer-auth.service.ts";
import { z } from "zod";
import { HttpError } from "../../errors/http-error.ts";
import asyncHandler from "../../middleware/async.middleware.ts";


export class BuyerAuthController {
    private buyerAuthService: BuyerAuthService;

    constructor(buyerAuthService: BuyerAuthService) {
        this.buyerAuthService = buyerAuthService;
    }

    createBuyer = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = CreatedBuyerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerAuthService.createBuyer(validatedData.data);

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
                token: result?.token,
                user: validatedResponseBuyerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer signup controller:", error);

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

    checkUsernameUnique = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { searchParams } = new URL(req.url);
            const queryParam = {
                username: searchParams.get("username")
            };

            if (!queryParam) {
                return res.status(400).json({
                    success: false,
                    message: "Username query parameter is required"
                });
            }

            const validatedData = CheckUsernameUniqueDto.safeParse(queryParam);

            if (!validatedData.success) {
                const formatted = z.treeifyError(validatedData.error);
                const usernameErrors = formatted.properties?.username?.errors || [];

                return res.status(400).json({
                    success: false,
                    message: usernameErrors.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters"
                });
            }

            const result = await this.buyerAuthService.checkUsernameUnique(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error checking username uniqueness controller: ", error);

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

            const result = await this.buyerAuthService.verifyOtpForRegistration(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer verify otp for registration controller:", error);

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

    loginBuyer = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = LoginBuyerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerAuthService.loginBuyer(validatedData.data);

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
                token: result?.token,
                user: validatedResponseBuyerData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer signup controller:", error);

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

            const result = await this.buyerAuthService.forgotPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer forgot password controller:", error);

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

    verifyOtpForResetPassword = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = VerifyOtpForResetPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerAuthService.verifyOtpForResetpassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer verify otp for reset password controller:", error);

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

            const result = await this.buyerAuthService.resetPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer reset password controller:", error);

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

            const result = await this.buyerAuthService.handleSendEmailForRegistration(validatedData.data);

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
            console.error("Error in buyer send verication email controller:", error);

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

    logoutBuyer = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.buyerAuthService.logoutBuyer();

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in buyer logout controller:", error);

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