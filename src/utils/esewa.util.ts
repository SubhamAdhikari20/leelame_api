// src/util/esewa.util.ts
import CryptoJS from "crypto-js";
import type { ESewaPayload } from "./../types/payment-gateways.type.ts";


export const buildESewaPayload = ( amount: number, transactionUuid: string): ESewaPayload => {
    const esewMerchantId = process.env.ESEWA_MERCHANT_ID;
    const esewSecretKey = process.env.ESEWA_SECRET_KEY;
    const esewBackendUrl = process.env.BASE_URL;

    if (!esewMerchantId || !esewSecretKey || !esewBackendUrl) {
        throw new Error("Missing required environment variables for eSewa integration.");
    }

    const total_amount = amount.toFixed(2);
    const transaction_uuid = transactionUuid;
    const product_code = esewMerchantId;
    const callbackUrl = `${esewBackendUrl}/api/payment/esewa-callback`;
    const success_url = callbackUrl;
    const failure_url = callbackUrl;

    const signed_field_names = "total_amount,transaction_uuid,product_code";

    const hashString =
        `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const secret = esewSecretKey;
    const signature = CryptoJS.HmacSHA256(hashString, secret)
        .toString(CryptoJS.enc.Base64);

    return {
        amount: amount.toString(),
        total_amount,
        tax_amount: "0",
        transaction_uuid,
        product_service_charge: "0",
        product_delivery_charge: "0",
        product_code,
        success_url,
        failure_url,
        signed_field_names,
        signature,
    };
};