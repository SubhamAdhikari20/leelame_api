// src/models/buyer.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "./user.model.ts";
import type { Buyer } from "./../types/buyer.type.ts";


export interface IBuyer extends Omit<Buyer, "userId">, Document {
    // export interface IBuyer extends Buyer, Document {
    userId: Schema.Types.ObjectId | string,
    createdAt: Date;
    updatedAt: Date;
}

export interface IBuyerPopulated extends Omit<IBuyer, "userId"> {
    userId: IUser;
}

const buyerSchema: Schema<IBuyer> = new Schema({
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
    username: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^[a-zA-Z0-9_]+$/, "IUsername can only contain letters, numbers, and underscores"],
        minLength: [3, "IUsername must be at least 3 characters"],
        maxLength: [30, "IUsername cannot exceed 30 characters"],
        // default: null
    },
    contact: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        minLength: [10, "Contact must be 10 digits"],
        maxLength: [10, "Contact must be 10 digits"],
        // default: null
    },
    password: {
        type: String,
        minLength: [8, "Password must be at least 8 characters"],
        // default: null
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        // default: null
    },
    bio: {
        type: String,
        maxLength: [500, "Bio cannot exceed 500 characters"],
        // default: null
    },
    terms: {
        type: Boolean,
        required: true,
        default: false
    },
},
    {
        timestamps: true
    }
);


const Buyer = (mongoose.models.buyers as mongoose.Model<IBuyer>) ?? (mongoose.model<IBuyer>("buyers", buyerSchema));

export default Buyer;