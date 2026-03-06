// src/types/payment.type.ts
import { z } from "zod";
import { amountValidation, methodValidation, statusValidation } from "./../schemas/payment.schema.ts";
import { IPayment } from "./../models/payment.model.ts";


const paymentSchema = z.object({
    orderId: z.string(),
    transactionId: z.string(),
    amount: amountValidation,
    method: methodValidation,
    status: statusValidation,
});
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentDocument = IPayment;