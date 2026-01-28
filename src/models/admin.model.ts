// src/models/admin.model.ts
import mongoose, { Schema, Document } from "mongoose";
import type { Admin } from "./../types/admin.type.ts";


export interface IAdmin extends Omit<Admin, "baseUserId">, Document {
    baseUserId: Schema.Types.ObjectId | string,
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema: Schema<IAdmin> = new Schema({
    baseUserId: {
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
        required: [true, "Password is required"],
        minLength: [8, "Password must be at least 8 characters"],
    },
},
    {
        timestamps: true
    }
);

const Admin = (mongoose.models.admins as mongoose.Model<IAdmin>) ?? (mongoose.model<IAdmin>("admins", adminSchema));

export default Admin;