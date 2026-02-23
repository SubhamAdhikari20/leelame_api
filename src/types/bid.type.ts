// src/types/bif.type.ts
import { z } from "zod";
import type { IBid } from "./../models/bid.model.ts";
import { bidAmountValidation } from "./../schemas/bid.schema.ts";


const bidSchema = z.object({
    productId: z.string(),
    buyerId: z.string(),
    bidAmount: bidAmountValidation,
});

export type Bid = z.infer<typeof bidSchema>;
export type BidDocument = IBid;