// src/controllers/product-condition.controller.ts
import type { Request, Response } from "express";
import { ProductConditionResponseDto, CreateProductConditionDto, UpdateProductConditionDto } from "./../dtos/product-condition.dto.ts";
import { ProductConditionService } from "./../services/product-condition.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class ProductConditionController {
    private productConditionService: ProductConditionService;

    constructor(productConditionService: ProductConditionService) {
        this.productConditionService = productConditionService;
    }

    createProductCondition = asyncHandler(async (req: Request, res: Response) => {
        try {
            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const validatedData = CreateProductConditionDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.productConditionService.createProductCondition(validatedData.data);

            const validatedResponseProductConditionData = CreateProductConditionDto.safeParse(result?.data);
            if (!validatedResponseProductConditionData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseProductConditionData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseProductConditionData.data,
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

    updateProductCondition = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productConditionId = await req.params.id;
            if (!productConditionId || productConditionId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product condition id is not sent through params."
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
            const validatedData = UpdateProductConditionDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.productConditionService.updateProductCondition(productConditionId.toString(), validatedData.data);
            const validatedResponseProductConditionData = ProductConditionResponseDto.safeParse(result?.data);
            if (!validatedResponseProductConditionData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseProductConditionData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseProductConditionData.data,
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

    deleteProductCondition = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productConditionId = await req.params.id;
            if (!productConditionId || productConditionId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product condition id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.productConditionService.deleteProductCondition(productConditionId.toString());

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

    getProductConditionById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productConditionId = await req.params.id;
            if (!productConditionId || productConditionId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product condition id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.productConditionService.getProductConditionById(productConditionId.toString());

            const validatedResponseProductConditionData = ProductConditionResponseDto.safeParse(result?.data);
            if (!validatedResponseProductConditionData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseProductConditionData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseProductConditionData.data,
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

    getAllProductConditions = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.productConditionService.getAllProductConditions();

            const validatedProductConditionsData = z.array(ProductConditionResponseDto).safeParse(result?.data);
            if (!validatedProductConditionsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedProductConditionsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedProductConditionsData.data,
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