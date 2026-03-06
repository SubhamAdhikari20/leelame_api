// src/models/payment.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Payment } from "./../types/payment.type.ts";


export interface IPayment extends Omit<Payment, "orderId">, Document {
    orderId: Schema.Types.ObjectId | string,
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema: Schema<IPayment> = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "orders",
        required: true,
    },
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please, add amount"],
    },
    method: {
        type: String,
        required: [true, "Payment method is required"],
        enum: ["esewa", "khalti"],
        default: "esewa",
    },
    status: {
        type: String,
        required: [true, "Payment status is required"],
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
},
    {
        timestamps: true
    }
);

const PaymentModel = (mongoose.models.payments as mongoose.Model<IPayment>) ?? (mongoose.model<IPayment>("payments", paymentSchema));

export default PaymentModel;