// src/models/order.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Order } from "./../types/order.type.ts";


export interface IOrder extends Omit<Order, ("productId" | "buyerId" | "sellerId" | "delivaryDate")>, Document {
    productId: Schema.Types.ObjectId | string,
    buyerId: Schema.Types.ObjectId | string,
    sellerId: Schema.Types.ObjectId | string,
    delivaryDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    buyerId: {
        type: Schema.Types.ObjectId,
        ref: "buyers",
        required: true,
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: "sellers",
        required: true,
    },
    delivaryDate: {
        type: Date,
        required: [true, "Delivery date is required"],
    },
    delivaryAddress: {
        type: String,
        required: [true, "Delivery address is required"],
    },
    totalPrice: {
        type: Number,
        required: [true, "Please, add total price"],
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "failed"],
        default: "pending",
    },
    paymentReference: {
        type: String,
        default: null,
    },
},
    {
        timestamps: true
    }
);

const OrderModel = (mongoose.models.orders as mongoose.Model<IOrder>) ?? (mongoose.model<IOrder>("orders", orderSchema));

export default OrderModel;