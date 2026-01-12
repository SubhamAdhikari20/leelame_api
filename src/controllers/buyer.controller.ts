// src/controllers/buyer.controller.ts
import type { Request, Response } from "express";
import { BuyerResponseDto, CheckUsernameUniqueDto, CreatedBuyerDto, ForgotPasswordDto, LoginBuyerDto, ResetPasswordDto, SendEmailForRegistrationDto, VerifyOtpForRegistrationDto, VerifyOtpForResetPasswordDto } from "@/dtos/buyer.dto.ts";
import { BuyerService } from "@/services/buyer.service.ts";
import { z } from "zod";
import { HttpError } from "@/errors/http-error.ts";


export class BuyerController {
    private buyerService: BuyerService;

    constructor(buyerService: BuyerService) {
        this.buyerService = buyerService;
    }

    createBuyer = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = CreatedBuyerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.createBuyer(validatedData.data);

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
        catch (error: any) {
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
    };

    checkUsernameUnique = async (req: Request, res: Response) => {
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

            const result = await this.buyerService.checkUsernameUnique(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: any) {
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
    };

    verifyOtpForRegistration = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = VerifyOtpForRegistrationDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.verifyOtpForRegistration(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: any) {
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
    };

    loginBuyer = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = LoginBuyerDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.loginBuyer(validatedData.data);

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
        catch (error: any) {
            console.error("Error in buyer signup controller:", error);

            if (error instanceof HttpError) {
                return Response.json(
                    {
                        success: false,
                        message: error.message
                    },
                    { status: error.status }
                );
            }

            return Response.json(
                {
                    success: false,
                    message: "Internal Server Error"
                },
                { status: 500 }
            );
        }
    };

    forgotPassword = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = ForgotPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.forgotPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: any) {
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
    };

    verifyOtpForResetPassword = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = VerifyOtpForResetPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.verifyOtpForResetpassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: any) {
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
    };

    resetPassword = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = ResetPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.resetPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: any) {
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
    };

    handleSendEmailForRegistration = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const validatedData = SendEmailForRegistrationDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.buyerService.handleSendEmailForRegistration(validatedData.data);

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
        catch (error: any) {
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
    };
}