// src/models/seller.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Seller } from "./../types/seller.type.ts";


export interface ISeller extends Omit<Seller, 'userId'>, Document {
    // export interface ISeller extends Seller, Document {
    userId: Schema.Types.ObjectId | string,
    createdAt: Date;
    updatedAt: Date;
}

const sellerSchema: Schema<ISeller> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true
    },
    contact: {
        type: String,
        required: [true, "Contact is required"],
        unique: true,
        trim: true,
        minLength: [10, "Contact must be 10 digits"],
        maxLength: [10, "Contact must be 10 digits"],
    },
    password: {
        type: String,
        minLength: [8, "Password must be at least 8 characters"],
        default: null
    },
    sellerNotes: {
        type: String,
        default: null
    },
    sellerStatus: {
        type: String,
        enum: ["none", "pending", "verified", "rejected"],
        default: "none"
    },
    sellerVerificationDate: {
        type: Date,
        default: null
    },
    sellerAttemptCount: {
        type: Number,
        default: 0
    },
    sellerRuleViolationCount: {
        type: Number,
        default: 0
    },
    isSellerPermanentlyBanned: {
        type: Boolean,
        default: false
    },
    sellerBannedAt: {
        type: Date,
        default: null
    },
    sellerBannedDateFrom: {
        type: Date,
        default: null
    },
    sellerBannedDateTo: {
        type: Date,
        default: null
    },
},
    {
        timestamps: true
    }
);

const Seller = (mongoose.models.sellers as mongoose.Model<ISeller>) ?? (mongoose.model<ISeller>("sellers", sellerSchema));

export default Seller;