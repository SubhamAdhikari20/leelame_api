// src/controllers/payment.controller.ts
import type { Request, Response } from "express";
import { PaymentResponseDto, InitiatePaymentDto, FinalizePaymentWithEsewaDto, FinalizePaymentWithKhaltiDto } from "./../dtos/payment.dto.ts";
import { PaymentService } from "./../services/payment.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class PaymentController {
    private paymentService: PaymentService;

    constructor(paymentService: PaymentService) {
        this.paymentService = paymentService;
    }

    initiatePayment = asyncHandler(async (req: Request, res: Response) => {
        try {
            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user with id not found."
                });
            }

            const body = await req.body;
            const validatedData = InitiatePaymentDto.safeParse(body);

            if (!validatedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedData.error)
                });
            }

            const result = await this.paymentService.initiatePayment(validatedData.data);

            const validatedResponsePaymentData = PaymentResponseDto.safeParse(result?.data);
            if (!validatedResponsePaymentData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponsePaymentData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponsePaymentData.data,
                gatewayUrl: result.gatewayUrl,
                formData: result.formData,
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

    finalizePaymentWithEsewa = asyncHandler(async (req: Request, res: Response) => {
        try {
            const base64 = await req.query.data as string;
            if (!base64) {
                res.redirect(`${process.env.FRONTEND_URL}/payment/receipt?status=failed`);
                return;
            }

            const jsonString = Buffer.from(base64, "base64").toString("utf-8");
            const payload = JSON.parse(jsonString);

            const result = await this.paymentService.finalizePaymentWithEsewa({
                transactionId: payload.transaction_uuid,
                gatewayRef: payload.transaction_code,
                status: payload.status === "COMPLETE" ? "success" : "failed",
            });

            const validatedResponsePaymentData = PaymentResponseDto.safeParse(result?.data);
            if (!validatedResponsePaymentData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponsePaymentData.error)
                });
            }

            const status = validatedResponsePaymentData.data.status === "success" ? "success" : "failed";
            res.redirect(
                `${process.env.FRONTEND_URL}/payment/receipt?status=${status}&transaction_id=${payload.transaction_uuid}`
            );
            return;
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

    finalizePaymentWithKhalti = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { pidx, status, transaction_id, purchase_order_id } = req.query;

            const isSuccess = status === "Completed";
            const finalStatus = isSuccess ? "success" : "failed";

            const result = await this.paymentService.finalizePaymentWithKhalti({
                transactionId: purchase_order_id as string,
                gatewayRef: transaction_id as string,
                status: finalStatus,
            });

            const validatedResponsePaymentData = PaymentResponseDto.safeParse(result?.data);
            if (!validatedResponsePaymentData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponsePaymentData.error)
                });
            }

            res.redirect(
                `${process.env.FRONTEND_URL}/payment/receipt?status=${finalStatus}&transaction_id=${transaction_id}`
            );
            return;
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

    deletePayment = asyncHandler(async (req: Request, res: Response) => {
        try {
            const paymentId = await req.params.id;
            if (!paymentId || paymentId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Payment id is not sent through params."
                });
            }

            const tokenUserId = await req.user?._id;
            if (!tokenUserId || tokenUserId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Token Error! Token user id not found."
                });
            }

            const result = await this.paymentService.deletePayment(paymentId.toString());

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

    getPaymentById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const paymentId = await req.params.id;
            if (!paymentId || paymentId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Payment id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            const result = await this.paymentService.getPaymentById(paymentId.toString());

            const validatedResponsePaymentData = PaymentResponseDto.safeParse(result?.data);
            if (!validatedResponsePaymentData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponsePaymentData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponsePaymentData.data,
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

    getAllPayments = asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await this.paymentService.getAllPayments();

            const validatedPaymentsData = z.array(PaymentResponseDto).safeParse(result?.data);
            if (!validatedPaymentsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedPaymentsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedPaymentsData.data,
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

    findAllPaymentsByProductId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const productId = await req.params.productId;
            if (!productId || productId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Product id is not sent through params."
                });
            }

            const result = await this.paymentService.findAllPaymentsByProductId(productId.toString());

            const validatedPaymentsData = z.array(PaymentResponseDto).safeParse(result?.data);
            if (!validatedPaymentsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedPaymentsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedPaymentsData.data,
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

    findAllPaymentsByBuyerId = asyncHandler(async (req: Request, res: Response) => {
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

            const result = await this.paymentService.findAllPaymentsByBuyerId(buyerId.toString());

            const validatedPaymentsData = z.array(PaymentResponseDto).safeParse(result?.data);
            if (!validatedPaymentsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedPaymentsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedPaymentsData.data,
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

    findAllPaymentsBySellerId = asyncHandler(async (req: Request, res: Response) => {
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

            const result = await this.paymentService.findAllPaymentsBySellerId(sellerId.toString());

            const validatedPaymentsData = z.array(PaymentResponseDto).safeParse(result?.data);
            if (!validatedPaymentsData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedPaymentsData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedPaymentsData.data,
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