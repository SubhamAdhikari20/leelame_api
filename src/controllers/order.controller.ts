// src/controllers/order.controller.ts
import type { Request, Response } from "express";
import { OrderResponseDto, CreateOrderDto, UpdateOrderDetailsDto, UpdateOrderStatusDto } from "./../dtos/order.dto.ts";
import { OrderService } from "./../services/order.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class OrderController {
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.orderService = orderService;
    }

    createOrder = asyncHandler(async (req: Request, res: Response) => {
        try {
            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            
            const validatedData = CreateOrderDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.orderService.createOrder(validatedData.data);

            const validatedResponseOrderData = OrderResponseDto.safeParse(result?.data);
            if (!validatedResponseOrderData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseOrderData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseOrderData.data,
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

    updateOrderDetails = asyncHandler(async (req: Request, res: Response) => {
        try {
            const orderId = await req.params.id;
            if (!orderId || orderId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Order id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const validatedData = UpdateOrderDetailsDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.orderService.updateOrderDetails(orderId.toString(), validatedData.data);

            const validatedResponseOrderData = OrderResponseDto.safeParse(result?.data);
            if (!validatedResponseOrderData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseOrderData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseOrderData.data,
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

    updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
        try {
            const orderId = await req.params.id;
            if (!orderId || orderId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Order id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const validatedData = UpdateOrderStatusDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.orderService.updateOrderStatus(orderId.toString(), validatedData.data);

            const validatedResponseOrderData = OrderResponseDto.safeParse(result?.data);
            if (!validatedResponseOrderData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseOrderData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseOrderData.data,
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

    deleteOrder = asyncHandler(async (req: Request, res: Response) => {
        try {
            const orderId = await req.params.id;
            if (!orderId || orderId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Order id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.orderService.deleteOrder(orderId.toString());

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

    getOrderById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const orderId = await req.params.id;
            if (!orderId || orderId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Order id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            const result = await this.orderService.getOrderById(orderId.toString());

            const validatedResponseOrderData = OrderResponseDto.safeParse(result?.data);
            if (!validatedResponseOrderData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseOrderData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseOrderData.data,
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

    getAllOrders = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.orderService.getAllOrders();

            const validatedOrdersData = z.array(OrderResponseDto).safeParse(result?.data);
            if (!validatedOrdersData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedOrdersData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedOrdersData.data,
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

    findAllOrdersByProductId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productId = await req.params.productId;
            if (!productId || productId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product id is not sent through params."
                });
            }

            const result = await this.orderService.findAllOrdersByProductId(productId.toString());

            const validatedOrdersData = z.array(OrderResponseDto).safeParse(result?.data);
            if (!validatedOrdersData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedOrdersData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedOrdersData.data,
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

    findAllOrdersByBuyerId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const buyerId = await req.params.buyerId;
            if (!buyerId || buyerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Buyer id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            // if (buyerId.toString() !== tokenUserId.toString()) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Params user id and token id mismatch!"
            //     });
            // }

            const result = await this.orderService.findAllOrdersByBuyerId(buyerId.toString());

            const validatedOrdersData = z.array(OrderResponseDto).safeParse(result?.data);
            if (!validatedOrdersData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedOrdersData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedOrdersData.data,
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

    findAllOrdersBySellerId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const sellerId = await req.params.sellerId;
            if (!sellerId || sellerId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Seller id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            // if (sellerId.toString() !== tokenUserId.toString()) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Params user id and token id mismatch!"
            //     });
            // }

            const result = await this.orderService.findAllOrdersBySellerId(sellerId.toString());

            const validatedOrdersData = z.array(OrderResponseDto).safeParse(result?.data);
            if (!validatedOrdersData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedOrdersData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedOrdersData.data,
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