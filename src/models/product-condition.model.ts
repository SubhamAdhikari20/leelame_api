// src/models/product-condition.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { ProductCondition } from "./../types/product-condition.type.ts";


export interface IProductCondition extends ProductCondition, Document {
    createdAt: Date;
    updatedAt: Date;
}

const productConditionSchema: Schema<IProductCondition> = new Schema({
    productConditionName: {
        type: String,
        required: [true, "Product Condition Name is required."],
        unique: [true, "Product Condition Name should be unique."],
        sparse: true,
        trim: true
    },
    description: {
        type: String,
        maxLength: [500, "Product Condition Description cannot exceed 500 characters"],
        default: null
    },
    productConditionEnum: {
        type: String,
        enum: ["NEW", "NEW_OTHER", "NEW_WITH_DEFECTS", "CERTIFIED_REFURBISHED", "EXCELLENT_REFURBISHED", "VERY_GOOD_REFURBISHED", "GOOD_REFURBISHED", "SELLER_REFURBISHED", "LIKE_NEW", "PRE_OWNED_EXCELLENT", "USED_EXCELLENT", "PRE_OWNED_FAIR", "USED_VERY_GOOD", "USED_GOOD", "USED_ACCEPTABLE", "FOR_PARTS_OR_NOT_WORKING"],
        default: "NEW"
    }
},
    {
        timestamps: true
    }
);

const ProductConditionModel = (mongoose.models.product_conditions as mongoose.Model<IProductCondition>) ?? (mongoose.model<IProductCondition>("product_conditions", productConditionSchema));

export default ProductConditionModel;