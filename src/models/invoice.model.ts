// src/models/invoice.model.ts
import mongoose, { Document, Schema } from "mongoose";
import type { Invoice } from "./../types/invoice.type.ts";

export interface Iinvoice extends Omit<Invoice, ("productId" | "buyerId" | "sellerId" | "orderId" | "paymentId")>, Document {
    productId: Schema.Types.ObjectId | string,
    buyerId: Schema.Types.ObjectId | string,
    sellerId: Schema.Types.ObjectId | string,
    invoiceId: Schema.Types.ObjectId | string,
    orderId: Schema.Types.ObjectId | string,
    paymentId: Schema.Types.ObjectId | string,
    createdAt: Date;
    updatedAt: Date;
}

const invoiceSchema: Schema<Iinvoice> = new Schema({
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
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "orders",
        required: true,
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: "payments",
        required: true,
    },
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
    },
    buyerName: {
        type: String,
        required: [true, "Buyer name is required"],
    },
    buyerContact: {
        type: String,
    },
    sellerName: {
        type: String,
        required: [true, "Seller name is required"],
    },
    sellerContact: {
        type: String,
        required: [true, "Seller contact is required"],
    },
    productName: {
        type: String,
        required: [true, "Product name is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    serviceCharge: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: [true, "Please, add total price"],
    },
    paymentMethod: {
        type: String,
        enum: ["khalti", "esewa"],
        default: "esewa",
    },
},
    {
        timestamps: true
    }
);

const InvoiceModel = (mongoose.models.invoices as mongoose.Model<Iinvoice>) ?? (mongoose.model<Iinvoice>("invoices", invoiceSchema));

export default InvoiceModel;