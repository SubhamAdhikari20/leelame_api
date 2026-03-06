// src/interfaces/payment.repository.interface.ts
import type { PaymentDocument, Payment } from "./../types/payment.type.ts";


export interface PaymentRepositoryInterface {
    initiatePayment(payment: Payment): Promise<PaymentDocument | null>;
    updatePayment(id: string, payment: Partial<Payment>): Promise<PaymentDocument | null>;
    deletePayment(id: string): Promise<boolean>;
    findPaymentById(id: string): Promise<PaymentDocument | null>;
    findPaymentByTransactionId(transactionId: string): Promise<PaymentDocument | null>;
    findPaymentByProductId(productId: string): Promise<PaymentDocument | null>;
    findPaymentByBuyerId(buyerId: string): Promise<PaymentDocument | null>;
    findPaymentBySellerId(sellerId: string): Promise<PaymentDocument | null>;
    findAllPaymentsByProductId(productId: string): Promise<PaymentDocument[] | null>;
    findAllPaymentsByBuyerId(buyerId: string): Promise<PaymentDocument[] | null>;
    findAllPaymentsBySellerId(sellerId: string): Promise<PaymentDocument[] | null>;
    getAllPayments(): Promise<PaymentDocument[] | null>;
}