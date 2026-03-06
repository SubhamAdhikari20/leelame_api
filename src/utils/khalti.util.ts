// src/util/khalti.util.ts
import axios from "axios";
import type { KhaltiInitRequest, KhaltiInitResponse, KhaltiVerifyResponse } from "./../types/payment-gateways.type.ts";


// Function to initiate Khalti Payment
export const initiateKhaltiPayment = async (req: KhaltiInitRequest): Promise<KhaltiInitResponse> => {
    const khaltiGatewayUrl = process.env.KHALTI_GATEWAY_URL;
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

    if (!khaltiGatewayUrl || !khaltiSecretKey) {
        throw new Error("Missing required environment variables for Khalti integration.");
    }

    const url = `${khaltiGatewayUrl}/api/v2/epayment/initiate/`;

    const payload = {
        return_url: req.return_url,
        website_url: req.website_url,
        amount: req.amount * 100,
        purchase_order_id: req.purchase_order_id,
        purchase_order_name: req.purchase_order_name,
    }

    const headersList = {
        headers:
        {
            "Authorization": `Key ${khaltiSecretKey}`,
            "Content-Type": "application/json",
        }
    };

    try {
        const response = await axios.post<KhaltiInitResponse>(url, payload, headersList);
        return response.data;
    }
    catch (error: Error | any) {
        console.error("Error initializing Khalti payment:", error.message);
        throw new Error("Failed to initiate Khalti payment");
    }
};


export const verifyKhaltiPayment = async (pidx: number): Promise<KhaltiVerifyResponse> => {
    const khaltiGatewayUrl = process.env.KHALTI_GATEWAY_URL;
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

    if (!khaltiGatewayUrl || !khaltiSecretKey) {
        throw new Error("Missing required environment variables for Khalti integration.");
    }

    const url = `${khaltiGatewayUrl}/api/v2/epayment/lookup/`
    const headersList = {
        headers:
        {
            "Authorization": `Key ${khaltiSecretKey}`,
            "Content-Type": "application/json",
        }
    };

    try {
        const response = await axios.post<KhaltiVerifyResponse>(url, { pidx }, headersList);
        return response.data;
    }
    catch (error: Error | any) {
        console.error("Error verifying Khalti payment:", error.message);
        throw new Error("Failed to verify Khalti payment");
    }
};