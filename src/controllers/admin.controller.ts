// src/controllers/admin.controller.ts
import type { Request, Response } from "express";
import { AdminResponseDto, GetAdminByEmailDto, GetAdminByIdDto, GetCurrentAdminDto } from "./../dtos/admin.dto.ts";
import { AdminService } from "./../services/admin.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class AdminController {
    private adminService: AdminService;

    constructor(adminService: AdminService) {
        this.adminService = adminService;
    }

    getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.params;
            const validatedData = GetCurrentAdminDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminService.getCurrentAdminUser(validatedData.data);

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
            console.error("Error in fetching admin data controller:", error);

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

    getAdminByEmail = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.params;
            const validatedData = GetAdminByEmailDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminService.getAdminByEmail(validatedData.data);

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
            console.error("Error in fetching admin data controller:", error);

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

    getAdminById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const body = await req.params;
            const validatedData = GetAdminByIdDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminService.getAdminById(validatedData.data);

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
            console.error("Error in fetching admin data controller:", error);

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