// src/repositories/payment.repository.ts
import type { PaymentRepositoryInterface } from "./../interfaces/payment.repository.interface.ts";
import type { Payment, PaymentDocument } from "./../types/payment.type.ts";
import PaymentModel from "./../models/payment.model.ts";
import ProductModel from "./../models/product.model.ts";


export class PaymentRepository implements PaymentRepositoryInterface {
    initiatePayment = async (payment: Payment): Promise<PaymentDocument | null> => {
        const newPayment = await PaymentModel.create(payment);
        return newPayment;
    };

    updatePayment = async (id: string, payment: Partial<Payment>): Promise<PaymentDocument | null> => {
        const updatedPayment = await PaymentModel.findByIdAndUpdate(id, payment, { new: true }).lean();
        return updatedPayment;
    };

    deletePayment = async (id: string): Promise<boolean> => {
        const deletedPayment = await PaymentModel.findByIdAndDelete(id);
        if (!deletedPayment) {
            return false;
        }
        return true;
    };

    findPaymentById = async (id: string): Promise<PaymentDocument | null> => {
        const payment = await PaymentModel.findById(id).lean();
        return payment;
    };

    findPaymentByTransactionId = async (transactionId: string): Promise<PaymentDocument | null> => {
        const payment = await PaymentModel.findOne({ transactionId: transactionId }).lean();
        return payment;
    };

    findPaymentByProductId = async (productId: string): Promise<PaymentDocument | null> => {
        const payment = await PaymentModel.findOne({ productId: productId }).lean();
        return payment;
    };

    findPaymentByBuyerId = async (buyerId: string): Promise<PaymentDocument | null> => {
        const payment = await PaymentModel.findOne({ buyerId: buyerId }).lean();
        return payment;
    };

    findPaymentBySellerId = async (sellerId: string): Promise<PaymentDocument | null> => {
        const product = await ProductModel.findOne({ sellerId: sellerId }).lean();
        if (!product) {
            return null;
        }

        const payment = await PaymentModel.findOne({ productId: product._id.toString() }).lean();
        return payment;
    };

    findAllPaymentsByProductId = async (productId: string): Promise<PaymentDocument[] | null> => {
        const payments = await PaymentModel.find({ productId: productId }).lean();
        return payments;
    };

    findAllPaymentsByBuyerId = async (buyerId: string): Promise<PaymentDocument[] | null> => {
        const payments = await PaymentModel.find({ buyerId: buyerId }).lean();
        return payments;
    };

    findAllPaymentsBySellerId = async (sellerId: string): Promise<PaymentDocument[] | null> => {
        const products = await ProductModel.find({ sellerId: sellerId }).lean();
        if (!products || products.length === 0) {
            return null;
        }

        const productIds = products.map((product) => product._id.toString());
        const payments = await PaymentModel.find({ productId: { $in: productIds } }).lean();
        return payments;
    };

    getAllPayments = async (): Promise<PaymentDocument[] | null> => {
        const payments = await PaymentModel.find().lean();
        return payments;
    };
}