// src/controllers/admin-auth.controller.ts
import type { Request, Response } from "express";
import { AdminResponseDto, CreatedAdminDto, ForgotPasswordDto, LoginAdminDto, ResetPasswordDto, SendEmailForRegistrationDto, VerifyOtpForRegistrationDto, VerifyOtpForResetPasswordDto } from "../../dtos/admin.dto.ts";
import { AdminAuthService } from "../../services/auth/admin-auth.service.ts";
import { z } from "zod";
import { HttpError } from "../../errors/http-error.ts";
import asyncHandler from "../../middleware/async.middleware.ts";


export class AdminAuthController {
    private adminAuthService: AdminAuthService;

    constructor(adminAuthService: AdminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    createAdmin = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.body;
            const validatedData = CreatedAdminDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.createAdmin(validatedData.data);

            const validatedResponseAdminData = AdminResponseDto.safeParse(result?.user);
            if (!validatedResponseAdminData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseAdminData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                token: result?.token,
                user: validatedResponseAdminData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin signup controller:", error);

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
            const body = await req.body;
            const validatedData = VerifyOtpForRegistrationDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.verifyOtpForRegistration(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin verify otp for registration controller:", error);

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

    loginAdmin = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.body;
            const validatedData = LoginAdminDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.loginAdmin(validatedData.data);

            const validatedResponseAdminData = AdminResponseDto.safeParse(result?.user);
            if (!validatedResponseAdminData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseAdminData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                token: result?.token,
                user: validatedResponseAdminData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin signup controller:", error);

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
            const body = await req.body;
            const validatedData = ForgotPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.forgotPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin forgot password controller:", error);

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
            const body = await req.body;
            const validatedData = VerifyOtpForResetPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.verifyOtpForResetpassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin verify otp for reset password controller:", error);

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
            const body = await req.body;
            const validatedData = ResetPasswordDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.resetPassword(validatedData.data);

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin reset password controller:", error);

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
            const body = await req.body;
            const validatedData = SendEmailForRegistrationDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminAuthService.handleSendEmailForRegistration(validatedData.data);

            const validatedResponseAdminData = AdminResponseDto.safeParse(result?.user);
            if (!validatedResponseAdminData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseAdminData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                user: validatedResponseAdminData.data,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin send verication email controller:", error);

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

    logoutAdmin = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.adminAuthService.logoutAdmin();

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in admin logout controller:", error);

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