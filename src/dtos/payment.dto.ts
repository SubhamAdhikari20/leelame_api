// src/dtos/payment.dto.ts
import { z } from "zod";
import { amountValidation, methodValidation, statusValidation } from "./../schemas/payment.schema.ts";
import type { ESewaPayload } from "@/types/payment-gateways.type.ts";


// Initiate Payment DTO
export const InitiatePaymentDto = z.object({
    orderId: z.string(),
    // transactionId: z.string(),
    amount: amountValidation,
    method: methodValidation,
    status: statusValidation,
});
export type InitiatePaymentDtoType = z.infer<typeof InitiatePaymentDto>;

// Finalize Payment With Esewa DTO
export const FinalizePaymentWithEsewaDto = z.object({
    transactionId: z.string(),
    gatewayRef: z.string(),
    status: statusValidation,
});
export type FinalizePaymentWithEsewaDtoType = z.infer<typeof FinalizePaymentWithEsewaDto>;

// Finalize Payment With Khalti DTO
export const FinalizePaymentWithKhaltiDto = z.object({
    transactionId: z.string(),
    gatewayRef: z.string(),
    // pidx: z.string(),
    status: statusValidation,
});
export type FinalizePaymentWithKhaltiDtoType = z.infer<typeof FinalizePaymentWithKhaltiDto>;


// Payment Response DTO
export const PaymentResponseDto = z.object({
    _id: z.string(),
    orderId: z.string(),
    transactionId: z.string(),
    amount: z.number(),
    method: z.string(),
    status: z.string(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type PaymentResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof PaymentResponseDto> | null;
    formData?: ESewaPayload | null;
    gatewayUrl?: string | null;
};

// All the payments response
export type AllPaymentsResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof PaymentResponseDto>[] | null;
};