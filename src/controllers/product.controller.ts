// src/controllers/product.controller.ts
import type { Request, Response } from "express";
import { ProductResponseDto, CreateProductDto, UpdateProductDto } from "./../dtos/product.dto.ts";
import { ProductService } from "./../services/product.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";
import { normalizeRemoveHttpUrl } from "./../helpers/http-url.helper.ts";


export class ProductController {
    private productService: ProductService;

    constructor(productService: ProductService) {
        this.productService = productService;
    }

    createProduct = asyncHandler(async (req: Request, res: Response) => {
        try {
            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const rawData = body.productData;
            let validatedData;
            if (rawData) {
                const parsedData = JSON.parse(rawData);
                // console.log("rawData: ", rawData);
                // console.log("parsedData: ", parsedData);

                validatedData = CreateProductDto.safeParse(parsedData);
                // console.log("validatedData: ", validatedData);
            }
            else {
                // console.log("body: ", body);

                validatedData = CreateProductDto.safeParse(body);
                // console.log("validatedData: ", validatedData);
            }

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const productImages: Express.Multer.File[] | undefined = Array.isArray(req.files)
                ? await req.files
                : undefined;
            const subFolder: string | undefined = await req.body.folder;
            let result;
            if (productImages && productImages.length > 0) {
                result = await this.productService.createProduct(tokenUserId.toString(), validatedData.data, productImages, subFolder);
            }
            else {
                result = await this.productService.createProduct(tokenUserId.toString(), validatedData.data);
            }

            const validatedResponseProductData = CreateProductDto.safeParse(result?.data);
            if (!validatedResponseProductData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseProductData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseProductData.data,
            });
        }
        catch (error: Error | any) {
            console.log("Error in create product controller: ", error.message);
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

    updateProduct = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productId = await req.params.id;
            if (!productId || productId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product id is not sent through params."
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
            const rawData = body.productData;
            let validatedData;
            if (rawData) {
                const parsedData = JSON.parse(rawData);
                // console.log("rawData: ", rawData);
                // console.log("parsedData: ", parsedData);

                validatedData = UpdateProductDto.safeParse(parsedData);
                // console.log("validatedData: ", validatedData);
            }
            else {
                // console.log("body: ", body);

                validatedData = UpdateProductDto.safeParse(body);
                // console.log("validatedData: ", validatedData);
            }

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const updateProductValidatedData = { ...validatedData.data, removedExisitingProductImageUrls: validatedData.data.removedExisitingProductImageUrls.map((removedExisitingProductImageUrl) => normalizeRemoveHttpUrl(removedExisitingProductImageUrl)).filter((url) => url !== null) as string[] };
            // console.log("updateProductValidatedData: ", updateProductValidatedData);

            const productImages: Express.Multer.File[] | undefined = Array.isArray(req.files)
                ? await req.files
                : undefined;
            const subFolder: string | undefined = await req.body.folder;
            let result;
            if (productImages && productImages.length > 0) {
                result = await this.productService.updateProduct(productId.toString(), updateProductValidatedData, productImages, subFolder);
            }
            else {
                result = await this.productService.updateProduct(productId.toString(), updateProductValidatedData);
            }

            const validatedResponseProductData = ProductResponseDto.safeParse(result?.data);
            if (!validatedResponseProductData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseProductData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseProductData.data,
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

    deleteProduct = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productId = await req.params.id;
            if (!productId || productId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.productService.deleteProduct(productId.toString());

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

    getProductById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productId = await req.params.id;
            if (!productId || productId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.productService.getProductById(productId.toString());

            const validatedResponseProductData = ProductResponseDto.safeParse(result?.data);
            if (!validatedResponseProductData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseProductData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseProductData.data,
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

    getAllProducts = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.productService.getAllProducts();

            const validatedProductsData = z.array(ProductResponseDto).safeParse(result?.data);
            if (!validatedProductsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedProductsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedProductsData.data,
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