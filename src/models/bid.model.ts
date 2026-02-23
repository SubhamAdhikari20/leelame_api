// src/models/bid.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Bid } from "./../types/bid.type.ts";


export interface IBid extends Omit<Bid, ("productId" | "buyerId")>, Document {
    productId: Schema.Types.ObjectId | string,
    buyerId: Schema.Types.ObjectId | string,
    createdAt: Date;
    updatedAt: Date;
}

const bidSchema: Schema<IBid> = new Schema({
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
    bidAmount: {
        type: Number,
        require: [true, "Enter a bid amount"],
    }
},
    {
        timestamps: true
    }
);

const BidModel = (mongoose.models.bids as mongoose.Model<IBid>) ?? (mongoose.model<IBid>("bids", bidSchema));

export default BidModel;