// src/controllers/category.controller.ts
import type { Request, Response } from "express";
import { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from "./../dtos/category.dto.ts";
import { CategoryService } from "./../services/category.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class CategoryController {
    private categoryService: CategoryService;

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService;
    }

    createCategory = asyncHandler(async (req: Request, res: Response) => {
        try {
            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const validatedData = CreateCategoryDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.categoryService.createCategory(validatedData.data);

            const validatedResponseCategoryData = CreateCategoryDto.safeParse(result?.data);
            if (!validatedResponseCategoryData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseCategoryData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseCategoryData.data,
            });
        }
        catch (error: Error | any) {
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

    updateCategory = asyncHandler(async (req: Request, res: Response) => {
        try {
            const categoryId = await req.params.id;
            if (!categoryId || categoryId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Category id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const body = await req.body;
            const validatedData = UpdateCategoryDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.categoryService.updateCategory(categoryId.toString(), validatedData.data);
            const validatedResponseCategoryData = CategoryResponseDto.safeParse(result?.data);
            if (!validatedResponseCategoryData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseCategoryData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseCategoryData.data,
            });
        }
        catch (error: Error | any) {
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

    deleteCategory = asyncHandler(async (req: Request, res: Response) => {
        try {
            const categoryId = await req.params.id;
            if (!categoryId || categoryId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Category id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.categoryService.deleteCategory(categoryId.toString());

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
            });
        }
        catch (error: Error | any) {
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

    getCategoryById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const categoryId = await req.params.id;
            if (!categoryId || categoryId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Category id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            const result = await this.categoryService.getCategoryById(categoryId.toString());

            const validatedResponseCategoryData = CategoryResponseDto.safeParse(result?.data);
            if (!validatedResponseCategoryData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseCategoryData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseCategoryData.data,
            });
        }
        catch (error: Error | any) {
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

    getAllCategories = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.categoryService.getAllCategories();

            const validatedCategorysData = z.array(CategoryResponseDto).safeParse(result?.data);
            if (!validatedCategorysData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedCategorysData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedCategorysData.data,
            });
        }
        catch (error: Error | any) {
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