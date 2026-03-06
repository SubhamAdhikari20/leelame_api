// src/controllers/invoice.controller.ts
import type { Request, Response } from "express";
import { InvoiceResponseDto } from "./../dtos/invoice.dto.ts";
import { InvoiceService } from "./../services/invoice.service.ts";
import { z } from "zod";
import { HttpError } from "./../errors/http-error.ts";
import asyncHandler from "./../middleware/async.middleware.ts";


export class InvoiceController {
    private invoiceService: InvoiceService;

    constructor(invoiceService: InvoiceService) {
        this.invoiceService = invoiceService;
    }

    getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
        try {
            const invoiceId = await req.params.id;
            if (!invoiceId || invoiceId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Invoice id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            const result = await this.invoiceService.getInvoiceById(invoiceId.toString());

            const validatedResponseInvoiceData = InvoiceResponseDto.safeParse(result?.data);
            if (!validatedResponseInvoiceData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseInvoiceData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseInvoiceData.data,
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

    getInvoiceByTransactionId = asyncHandler(async (req: Request, res: Response) => {
        try {
            const transactionId = await req.params.transactionId;
            if (!transactionId || transactionId.toString() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Params Error! Transaction id is not sent through params."
                });
            }

            // const tokenUserId = await req.user?._id;
            // if (!tokenUserId || tokenUserId.toString() === "") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Token Error! Token user id not found."
            //     });
            // }

            const result = await this.invoiceService.getInvoiceByTransactionId(transactionId.toString());

            const validatedResponseInvoiceData = InvoiceResponseDto.safeParse(result?.data);
            if (!validatedResponseInvoiceData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(validatedResponseInvoiceData.error)
                });
            }

            return res.status(result?.status ?? 200).json({
                success: result?.success,
                message: result?.message,
                data: validatedResponseInvoiceData.data,
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