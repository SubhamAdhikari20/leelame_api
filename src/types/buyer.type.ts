// src/types/buyer.type.ts
import { z } from "zod";
import { fullNameValidation, usernameValidation, contactValidation, passwordValidation, bioValidation, termsAndConditionsValidation } from "./../schemas/user.schema.ts";
import { IBuyer } from "./../models/buyer.model.ts";


export const buyerSchema = z.object({
    fullName: fullNameValidation,
    username: usernameValidation.nullish(),
    contact: contactValidation.nullish(),
    password: passwordValidation.nullish(),
    terms: termsAndConditionsValidation,
    userId: z.string(),

    googleId: z.string().nullish(),
    bio: bioValidation,
});

export type Buyer = z.infer<typeof buyerSchema>;

export type BuyerDocument = IBuyer;


// Google Provider
export const googleProviderBuyerSchema = z.object({
    fullName: fullNameValidation,
    username: usernameValidation.nullish(),
    contact: contactValidation.nullish(),
    password: passwordValidation.nullish(),
    terms: termsAndConditionsValidation,
    userId: z.string(),

    googleId: z.string().nullish(),
    bio: bioValidation
});

export type ProviderBuyer = z.infer<typeof googleProviderBuyerSchema>;