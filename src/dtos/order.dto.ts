// src/dtos/order.dto.ts
import { z } from "zod";
import { delivaryAddressValidation, delivaryDateValidation, totalPriceValidation, statusValidation } from "./../schemas/order.schema.ts";


// Create Order DTO
export const CreateOrderDto = z.object({
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
export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;

export const UpdateOrderDetailsDto = z.object({
    productId: z.string(),
    buyerId: z.string(),
    sellerId: z.string(),
    delivaryAddress: delivaryAddressValidation,
    delivaryDate: delivaryDateValidation,
    totalPrice: totalPriceValidation,
    status: statusValidation,
}).refine((o) => o.delivaryDate > new Date(), {
    message: "Delivery date must be in the future",
    path: ["delivaryDate"],
});
export type UpdateOrderDetailsDtoType = z.infer<typeof UpdateOrderDetailsDto>;

export const UpdateOrderStatusDto = z.object({
    status: statusValidation,
});
export type UpdateOrderStatusDtoType = z.infer<typeof UpdateOrderStatusDto>;

// Order Response DTO
export const OrderResponseDto = z.object({
    _id: z.string(),
    productId: z.string(),
    buyerId: z.string(),
    sellerId: z.string(),
    delivaryAddress: z.string(),
    delivaryDate: z.date(),
    totalPrice: z.number(),
    status: z.string(),
    paymentReference: z.string().nullish(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});
export type OrderResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof OrderResponseDto> | null;
};

// All the orders response
export type AllOrdersResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof OrderResponseDto>[] | null;
};