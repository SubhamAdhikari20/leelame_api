// src/types/buyer.type.ts
import { z } from "zod";
import { fullNameValidation, usernameValidation, contactValidation, passwordValidation, bioValidation, termsAndConditionsValidation } from "./../schemas/user.schema.ts";
import type { IBuyer } from "./../models/buyer.model.ts";


const buyerSchema = z.object({
    fullName: fullNameValidation,
    username: usernameValidation.nullish(),
    contact: contactValidation.nullish(),
    password: passwordValidation.nullish(),
    terms: termsAndConditionsValidation,
    baseUserId: z.string(),
    profilePictureUrl: z.string().nullish(),

    googleId: z.string().nullish(),
    bio: bioValidation,
});

export type Buyer = z.infer<typeof buyerSchema>;

export type BuyerDocument = IBuyer;


// Google Provider
const googleProviderBuyerSchema = z.object({
    fullName: fullNameValidation,
    username: usernameValidation.nullish(),
    contact: contactValidation.nullish(),
    password: passwordValidation.nullish(),
    terms: termsAndConditionsValidation,
    baseUserId: z.string(),
    profilePictureUrl: z.string().nullish(),

    googleId: z.string().nullish(),
    bio: bioValidation,
});

export type ProviderBuyer = z.infer<typeof googleProviderBuyerSchema>;