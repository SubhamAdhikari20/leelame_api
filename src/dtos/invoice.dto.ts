// src/dtos/invoice.dto.ts
import { z } from "zod";
import { buyerNameValidation, buyerContactValidation, sellerNameValidation, sellerContactValidation, productNameValidation, priceValidation, paymentMethodValidation, serviceChargeValidation, totalPriceValidation } from "./../schemas/invoice.schema.ts";
import { create } from "domain";


// Create Invoice DTO
export const CreateInvoiceDto = z.object({
    buyerName: buyerNameValidation,
    buyerContact: buyerContactValidation.nullish(),
    sellerName: sellerNameValidation,
    sellerContact: sellerContactValidation,
    productName: productNameValidation,
    price: priceValidation,
    serviceCharge: serviceChargeValidation,
    totalPrice: totalPriceValidation,
    paymentMethod: paymentMethodValidation,
    buyerId: z.string(),
    sellerId: z.string(),
    productId: z.string(),
    orderId: z.string(),
    paymentId: z.string(),
    transactionId: z.string(),
});
export type CreateInvoiceDtoType = z.infer<typeof CreateInvoiceDto>;

export const UpdateInvoiceDetailsDto = z.object({
    buyerName: buyerNameValidation,
    buyerContact: buyerContactValidation.nullish(),
    sellerName: sellerNameValidation,
    sellerContact: sellerContactValidation,
    productName: productNameValidation,
    price: priceValidation,
    serviceCharge: serviceChargeValidation,
    totalPrice: totalPriceValidation,
    paymentMethod: paymentMethodValidation,
    buyerId: z.string(),
    sellerId: z.string(),
    productId: z.string(),
    orderId: z.string(),
    paymentId: z.string(),
    transactionId: z.string(),
});
export type UpdateInvoiceDetailsDtoType = z.infer<typeof UpdateInvoiceDetailsDto>;


// Invoice Response DTO
export const InvoiceResponseDto = z.object({
    _id: z.string(),
    buyerName: z.string(),
    buyerContact: z.string().nullish(),
    sellerName: z.string(),
    sellerContact: z.string(),
    productName: z.string(),
    price: z.number(),
    serviceCharge: z.number(),
    totalPrice: z.number(),
    paymentMethod: z.string(),
    buyerId: z.string(),
    sellerId: z.string(),
    productId: z.string(),
    orderId: z.string(),
    paymentId: z.string(),
    transactionId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type InvoiceResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof InvoiceResponseDto> | null;
};

// All the invoices response
export type AllInvoicesResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof InvoiceResponseDto>[] | null;
};