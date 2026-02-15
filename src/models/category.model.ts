// src/models/category.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Category } from "./../types/category.type.ts";


export interface ICategory extends Category, Document {
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema({
    categoryName: {
        type: String,
        required: [true, "Category Name is required."],
        unique: [true, "Category Name should be unique."],
        sparse: true,
        trim: true
    },
    description: {
        type: String,
        maxLength: [500, "Category Description cannot exceed 500 characters"],
        default: null
    },
    categoryStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    }
},
    {
        timestamps: true
    }
);

const CategoryModel = (mongoose.models.categories as mongoose.Model<ICategory>) ?? (mongoose.model<ICategory>("categories", categorySchema));

export default CategoryModel;