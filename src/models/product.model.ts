// src/models/product.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Product } from "./../types/product.type.ts";


export interface IProduct extends Omit<Product, ("sellerId" | "categoryId" | "soldToBuyerId" | "endDate")>, Document {
    sellerId: Schema.Types.ObjectId | string,
    categoryId: Schema.Types.ObjectId | string,
    soldToBuyerId: Schema.Types.ObjectId | string | null | undefined,
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema: Schema<IProduct> = new Schema({
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: "sellers",
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
        maxLength: [500, "Product description cannot exceed 500 characters"],
        trim: true,
        default: null
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "categories",
        unique: true,
        sparse: true,
    },
    commission: {
        type: Number,
        default: 0
    },
    startPrice: {
        type: Number,
        require: [true, "Please add a starting price"],
    },
    currentBidPrice: {
        type: Number,
        require: true,
    },
    bidIntervalPrice: {
        type: Number,
        require: [true, "Please add the bid interval price between bids"],
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"],
    },
    productImageUrls: {
        type: [String],
        default: []
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    isSoldOut: {
        type: Boolean,
        required: true,
        default: false
    },
    soldToBuyerId: {
        type: Schema.Types.ObjectId,
        ref: "buyers",
        unique: true,
        sparse: true,
        default: null
    }
},
    {
        timestamps: true
    }
);

const ProductModel = (mongoose.models.products as mongoose.Model<IProduct>) ?? (mongoose.model<IProduct>("products", productSchema));

export default ProductModel;