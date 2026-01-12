// src/types/user.type.ts
import { z } from "zod";
import type { IUser } from "./../models/user.model.ts";


export const userSchema = z.object({
    email: z.email().min(5).max(50),
    profilePictureUrl: z.string().nullish(),
    role: z.enum(["admin", "seller", "buyer"]),
    isVerified: z.boolean(),
    verifyCode: z.string().nullish(),
    verifyCodeExpiryDate: z.date().nullish(),
    verifyEmailResetPassword: z.string().nullish(),
    verifyEmailResetPasswordExpiryDate: z.date().nullish(),
    isPermanentlyBanned: z.boolean(),
    banReason: z.string().nullish(),
    bannedAt: z.date().nullish(),
    bannedDateFrom: z.date().nullish(),
    bannedDateTo: z.date().nullish(),

    buyerProfile: z.string().nullish(),
    sellerProfile: z.string().nullish(),
    adminProfile: z.string().nullish(),
});

export type User = z.infer<typeof userSchema>;

export type UserDocument = IUser;