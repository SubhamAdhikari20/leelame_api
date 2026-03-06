// src/types/order.type.ts
import { z } from "zod";
import { delivaryAddressValidation, delivaryDateValidation, totalPriceValidation, statusValidation } from "./../schemas/order.schema.ts";
import type { IOrder } from "./../models/order.model.ts";


const orderSchema = z.object({
    productId: z.string(),
    buyerId: z.string(),
    sellerId: z.string(),
    delivaryAddress: delivaryAddressValidation,
    delivaryDate: delivaryDateValidation,
    totalPrice: totalPriceValidation,
    status: statusValidation,
    paymentReference: z.string().nullish(),
}).refine((o) => o.delivaryDate > new Date(), {
    message: "Delivery date must be in the future",
    path: ["delivaryDate"],
});
export type Order = z.infer<typeof orderSchema>;
export type OrderDocument = IOrder;