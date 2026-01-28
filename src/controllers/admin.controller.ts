// src/controllers/admin.controller.ts
import type { Request, Response } from "express";
import { AdminResponseDto, UpdateAdminProfileDetailsDto, UploadAdminProfilePictureDto, UploadImageAdminResponseDto } from "./../dtos/admin.dto.ts";
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
            const adminId = await req.params.id;
            if (!adminId || adminId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Admin id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token admin id not found."
                });
            }

            if (adminId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.adminService.getCurrentAdminUser(adminId.toString());

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

    updateAdminProfileDetails = asyncHandler(async (req: Request, res: Response) => {
        try {
            const adminId = await req.params.id;
            if (!adminId || adminId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Admin id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token admin id not found."
                });
            }

            if (adminId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const body = await req.body;
            const validatedData = UpdateAdminProfileDetailsDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminService.updateAdminProfileDetails(adminId.toString(), validatedData.data);
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
            console.error("Error updating admin details in controller: ", error);

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
            const adminId = await req.params.id;
            if (!adminId || adminId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Admin id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token admin id not found."
                });
            }

            if (adminId.toString() !== tokenUserId.toString()) {
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

            const validatedData = UploadAdminProfilePictureDto.safeParse(file);
            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.adminService.uploadProfilePicture(adminId.toString(), validatedData.data);
            const validatedResponseAdminData = UploadImageAdminResponseDto.safeParse(result?.data);
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
            console.error("Error uploading admin profile picture in controller: ", error);

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

    deleteAdminAccount = asyncHandler(async (req: Request, res: Response) => {
        try {
            const adminId = await req.params.id;
            if (!adminId || adminId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Admin id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token admin id not found."
                });
            }

            if (adminId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.adminService.deleteAdminAccount(adminId.toString());

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
            console.error("Error in deleting admin account controller:", error);

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
            const adminId = await req.params.id;
            if (!adminId || adminId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Admin id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token admin id not found."
                });
            }

            if (adminId.toString() !== tokenUserId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Params id and toke id mismatch!"
                });
            }

            const result = await this.adminService.getAdminByEmail(adminId.toString());

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