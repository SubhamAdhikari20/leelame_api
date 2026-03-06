// src/types/invoice.type.ts
import { z } from "zod";
import { buyerNameValidation, buyerContactValidation, sellerNameValidation, sellerContactValidation, productNameValidation, priceValidation, paymentMethodValidation, serviceChargeValidation, totalPriceValidation } from "./../schemas/invoice.schema.ts";
import type { Iinvoice } from "./../models/invoice.model.ts";


const invoiceSchema = z.object({
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
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceDocument = Iinvoice;