// types/payment-gateways.type.ts


export interface ESewaPayload {
    amount: string;
    total_amount: string;
    tax_amount: string;
    transaction_uuid: string;
    product_service_charge: string;
    product_delivery_charge: string;
    product_code: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export interface KhaltiInitRequest {
    return_url: string;
    website_url: string;
    amount: number;
    purchase_order_id: string;
    purchase_order_name: string;
}

export interface KhaltiInitResponse {
    pidx: number;
    payment_url: string;
}

export interface KhaltiVerifyResponse {
    idx: number;
    status: string;
}