// src/types/user.type.ts
import { z } from "zod";
import { fullNameValidation, contactValidation, passwordValidation, bioValidation } from "./../schemas/user.schema.ts";
import type { ISeller } from "./../models/seller.model.ts";


const sellerSchema = z.object({
    fullName: fullNameValidation,
    contact: contactValidation,
    password: passwordValidation.nullish(),
    profilePictureUrl: z.string().nullish(),
    baseUserId: z.string(),
    bio: bioValidation,

    sellerNotes: z.string().nullish(),
    sellerStatus: z.enum(["none", "pending", "verified", "rejected"]),
    sellerVerificationDate: z.date().nullish(),
    sellerAttemptCount: z.number(),
    sellerRuleViolationCount: z.number(),
    isSellerPermanentlyBanned: z.boolean(),
    sellerBannedAt: z.date().nullish(),
    sellerBannedDateFrom: z.date().nullish(),
    sellerBannedDateTo: z.date().nullish()
});

export type Seller = z.infer<typeof sellerSchema>;

export type SellerDocument = ISeller;