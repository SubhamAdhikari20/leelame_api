// src/services/payment.service.ts
import type { PaymentResponseDtoType, InitiatePaymentDtoType, AllPaymentsResponseDtoType, FinalizePaymentWithEsewaDtoType, FinalizePaymentWithKhaltiDtoType } from "./../dtos/payment.dto.ts";
import type { PaymentRepositoryInterface } from "./../interfaces/payment.repository.interface.ts";
import type { OrderRepositoryInterface } from "./../interfaces/order.repository.interface.ts";
import type { ProductRepositoryInterface } from "./../interfaces/product.repository.interface.ts";
import type { InvoiceRepositoryInterface } from "./../interfaces/invoice.repository.interface.ts";
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { buildESewaPayload } from "./../utils/esewa.util.ts";
import { initiateKhaltiPayment } from "./../utils/khalti.util.ts";


export class PaymentService {
    private paymentRepo: PaymentRepositoryInterface;
    private orderRepo: OrderRepositoryInterface;
    private productRepo: ProductRepositoryInterface;
    private invoiceRepo: InvoiceRepositoryInterface;
    private buyerRepo: BuyerRepositoryInterface;
    private sellerRepo: SellerRepositoryInterface;

    constructor(
        paymentRepo: PaymentRepositoryInterface,
        orderRepo: OrderRepositoryInterface,
        productRepo: ProductRepositoryInterface,
        invoiceRepo: InvoiceRepositoryInterface,
        buyerRepo: BuyerRepositoryInterface,
        sellerRepo: SellerRepositoryInterface
    ) {
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.invoiceRepo = invoiceRepo;
        this.buyerRepo = buyerRepo;
        this.sellerRepo = sellerRepo;
    }

    initiatePayment = async (initiatePaymentData: InitiatePaymentDtoType): Promise<PaymentResponseDtoType> => {
        const { orderId, amount, method, status } = initiatePaymentData;

        const exisitingOrderByOrderId = await this.orderRepo.findOrderById(orderId);
        if (!exisitingOrderByOrderId) {
            throw new HttpError(401, "Order with this id not found!");
        }

        if (exisitingOrderByOrderId.status !== "pending") {
            throw new HttpError(400, "Order is already processed!");
        }

        const transactionId = crypto.randomUUID();

        const newPayment = await this.paymentRepo.initiatePayment({
            orderId: orderId,
            transactionId: transactionId,
            amount: amount,
            method: method,
            status: status
        });

        if (!newPayment) {
            throw new HttpError(400, "Payment is not created!");
        }

        if (method === "esewa") {
            const payload = buildESewaPayload(amount, transactionId);

            const response: PaymentResponseDtoType = {
                success: true,
                message: "Payment placed successfully.",
                status: 201,
                data: {
                    _id: newPayment._id.toString(),
                    orderId: newPayment.orderId.toString(),
                    transactionId: newPayment.transactionId.toString(),
                    amount: newPayment.amount,
                    method: newPayment.method,
                    status: newPayment.status,
                    createdAt: newPayment.createdAt,
                    updatedAt: newPayment.updatedAt
                },
                gatewayUrl: `${process.env.ESEWA_GATEWAY_URL}/api/epay/main/v2/form`,
                formData: payload
            };
            return response;
        }
        else {
            const existingProductByProductId = await this.productRepo.findProductById(exisitingOrderByOrderId.productId.toString());
            if (!existingProductByProductId) {
                throw new HttpError(401, "Product with this id not found!");
            }

            const initKhalti = await initiateKhaltiPayment({
                return_url: `${process.env.BASE_URL}/api/payment/khalti-callback`,
                website_url: process.env.FRONTEND_URL!,
                amount,
                purchase_order_id: transactionId,
                purchase_order_name: existingProductByProductId.productName,
            });

            const response: PaymentResponseDtoType = {
                success: true,
                message: "Payment placed successfully.",
                status: 201,
                data: {
                    _id: newPayment._id.toString(),
                    orderId: newPayment.orderId.toString(),
                    transactionId: newPayment.transactionId.toString(),
                    amount: newPayment.amount,
                    method: newPayment.method,
                    status: newPayment.status,
                    createdAt: newPayment.createdAt,
                    updatedAt: newPayment.updatedAt
                },
                gatewayUrl: initKhalti.payment_url,
            };
            return response;
        }
    };

    finalizePaymentWithEsewa = async (finalizePaymentWithEsewaData: FinalizePaymentWithEsewaDtoType): Promise<PaymentResponseDtoType> => {
        const { transactionId, gatewayRef, status } = finalizePaymentWithEsewaData;

        const existingPaymentByTransactionId = await this.paymentRepo.findPaymentByTransactionId(transactionId);
        if (!existingPaymentByTransactionId) {
            throw new HttpError(404, "Payment with this transaction id not found!");
        }

        const updatedPayment = await this.paymentRepo.updatePayment(existingPaymentByTransactionId._id.toString(), {
            transactionId: transactionId,
            status: status
        });

        if (!updatedPayment) {
            throw new HttpError(400, "Payment is not updated!");
        }

        const updatedOrder = await this.orderRepo.updateOrder(updatedPayment.orderId.toString(), {
            status: status === "success" ? "confirmed" : "failed",
            paymentReference: gatewayRef
        });

        if (!updatedOrder) {
            throw new HttpError(400, "Order is not updated!");
        }

        if (status === "success") {
            const existingProductByProductId = await this.productRepo.findProductById(updatedOrder.productId.toString());
            if (!existingProductByProductId) {
                throw new HttpError(401, "Product with this id not found!");
            }

            await this.productRepo.updateProduct(existingProductByProductId._id.toString(), {
                isSoldOut: true,
                soldToBuyerId: updatedOrder.buyerId.toString()
            });
        }

        const existingBuyerByBuyerId = await this.buyerRepo.findBuyerById(updatedOrder.buyerId.toString());
        if (!existingBuyerByBuyerId) {
            throw new HttpError(401, "Buyer with this id not found!");
        }

        const existingSellerBySellerId = await this.sellerRepo.findSellerById(updatedOrder.sellerId.toString());
        if (!existingSellerBySellerId) {
            throw new HttpError(401, "Seller with this id not found!");
        }

        const existingProductByProductId = await this.productRepo.findProductById(updatedOrder.productId.toString());
        if (!existingProductByProductId) {
            throw new HttpError(401, "Product with this id not found!");
        }

        const newInvoice = await this.invoiceRepo.createInvoice({
            buyerName: existingBuyerByBuyerId.fullName,
            buyerContact: existingBuyerByBuyerId.contact,
            sellerName: existingSellerBySellerId.fullName,
            sellerContact: existingSellerBySellerId.contact,
            productName: existingProductByProductId.productName,
            price: existingProductByProductId.currentBidPrice,
            serviceCharge: existingProductByProductId.commission,
            totalPrice: updatedPayment.amount,
            paymentMethod: updatedPayment.method,
            buyerId: updatedOrder.buyerId.toString(),
            sellerId: updatedOrder.sellerId.toString(),
            productId: updatedOrder.productId.toString(),
            orderId: updatedOrder._id.toString(),
            paymentId: updatedPayment._id.toString(),
            transactionId: updatedPayment.transactionId.toString(),
        });

        if (!newInvoice) {
            throw new HttpError(400, "Invoice is not created!");
        }

        const response: PaymentResponseDtoType = {
            success: true,
            message: "Payment finalized with Khalti successfully.",
            status: 200,
            data: {
                _id: updatedPayment._id.toString(),
                orderId: updatedPayment.orderId.toString(),
                transactionId: updatedPayment.transactionId.toString(),
                amount: updatedPayment.amount,
                method: updatedPayment.method,
                status: updatedPayment.status,
                createdAt: updatedPayment.createdAt,
                updatedAt: updatedPayment.updatedAt
            }
        };
        return response;
    };

    finalizePaymentWithKhalti = async (finalizePaymentWithKhaltiData: FinalizePaymentWithKhaltiDtoType): Promise<PaymentResponseDtoType> => {
        const { transactionId, gatewayRef, status } = finalizePaymentWithKhaltiData;

        const existingPaymentByTransactionId = await this.paymentRepo.findPaymentByTransactionId(transactionId);
        if (!existingPaymentByTransactionId) {
            throw new HttpError(404, "Payment with this transaction id not found!");
        }

        const updatedPayment = await this.paymentRepo.updatePayment(existingPaymentByTransactionId._id.toString(), {
            // transactionId: transactionId,
            transactionId: gatewayRef,
            status: status
        });

        if (!updatedPayment) {
            throw new HttpError(400, "Payment is not updated!");
        }

        const updatedOrder = await this.orderRepo.updateOrder(updatedPayment.orderId.toString(), {
            status: status === "success" ? "confirmed" : "failed",
            paymentReference: gatewayRef
        });

        if (!updatedOrder) {
            throw new HttpError(400, "Order is not updated!");
        }

        if (status === "success") {
            const existingProductByProductId = await this.productRepo.findProductById(updatedOrder.productId.toString());
            if (!existingProductByProductId) {
                throw new HttpError(401, "Product with this id not found!");
            }

            await this.productRepo.updateProduct(existingProductByProductId._id.toString(), {
                isSoldOut: true
            });
        }

        const existingBuyerByBuyerId = await this.buyerRepo.findBuyerById(updatedOrder.buyerId.toString());
        if (!existingBuyerByBuyerId) {
            throw new HttpError(401, "Buyer with this id not found!");
        }

        const existingSellerBySellerId = await this.sellerRepo.findSellerById(updatedOrder.sellerId.toString());
        if (!existingSellerBySellerId) {
            throw new HttpError(401, "Seller with this id not found!");
        }

        const existingProductByProductId = await this.productRepo.findProductById(updatedOrder.productId.toString());
        if (!existingProductByProductId) {
            throw new HttpError(401, "Product with this id not found!");
        }

        const newInvoice = await this.invoiceRepo.createInvoice({
            buyerName: existingBuyerByBuyerId.fullName,
            buyerContact: existingBuyerByBuyerId.contact,
            sellerName: existingSellerBySellerId.fullName,
            sellerContact: existingSellerBySellerId.contact,
            productName: existingProductByProductId.productName,
            price: existingProductByProductId.currentBidPrice,
            serviceCharge: existingProductByProductId.commission,
            totalPrice: updatedPayment.amount,
            paymentMethod: updatedPayment.method,
            buyerId: updatedOrder.buyerId.toString(),
            sellerId: updatedOrder.sellerId.toString(),
            productId: updatedOrder.productId.toString(),
            orderId: updatedOrder._id.toString(),
            paymentId: updatedPayment._id.toString(),
            transactionId: updatedPayment.transactionId.toString(),
        });

        if (!newInvoice) {
            throw new HttpError(400, "Invoice is not created!");
        }

        const response: PaymentResponseDtoType = {
            success: true,
            message: "Payment finalized with Khalti successfully.",
            status: 200,
            data: {
                _id: updatedPayment._id.toString(),
                orderId: updatedPayment.orderId.toString(),
                transactionId: updatedPayment.transactionId.toString(),
                amount: updatedPayment.amount,
                method: updatedPayment.method,
                status: updatedPayment.status,
                createdAt: updatedPayment.createdAt,
                updatedAt: updatedPayment.updatedAt
            }
        };
        return response;
    };

    deletePayment = async (paymentId: string): Promise<PaymentResponseDtoType> => {
        const decodedPaymentId = decodeURIComponent(paymentId);
        const deletedPayment = await this.paymentRepo.deletePayment(decodedPaymentId);
        if (!deletedPayment) {
            throw new HttpError(400, "Payment is not deleted!");
        }

        const response: PaymentResponseDtoType = {
            success: true,
            message: "Payment deleted successfully.",
            status: 200
        };
        return response;
    };

    getPaymentById = async (paymentId: string): Promise<PaymentResponseDtoType> => {
        const decodedPaymentId = decodeURIComponent(paymentId);
        const existingPaymentById = await this.paymentRepo.findPaymentById(decodedPaymentId);
        if (!existingPaymentById) {
            throw new HttpError(404, "Payment with this id not found!");
        }

        const response: PaymentResponseDtoType = {
            success: true,
            message: "Payment details updated successfully.",
            status: 200,
            data: {
                _id: existingPaymentById._id.toString(),
                orderId: existingPaymentById.orderId.toString(),
                transactionId: existingPaymentById.transactionId.toString(),
                amount: existingPaymentById.amount,
                method: existingPaymentById.method,
                status: existingPaymentById.status,
                createdAt: existingPaymentById.createdAt,
                updatedAt: existingPaymentById.updatedAt
            }
        };
        return response;
    };

    getAllPayments = async (): Promise<AllPaymentsResponseDtoType> => {
        const allPayments = await this.paymentRepo.getAllPayments();
        if (!allPayments) {
            throw new HttpError(404, "Payments could not be fetched!");
        }

        const payments = await Promise.all(
            allPayments.map(async (payment) => {
                return {
                    _id: payment._id.toString(),
                    orderId: payment.orderId.toString(),
                    transactionId: payment.transactionId.toString(),
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt
                };
            })
        );

        const response: AllPaymentsResponseDtoType = {
            success: true,
            message: "All payments fetched successfully.",
            status: 200,
            data: payments
        };
        return response;
    };

    findAllPaymentsByProductId = async (productId: string): Promise<AllPaymentsResponseDtoType> => {
        const allPaymentsByProductId = await this.paymentRepo.findAllPaymentsByProductId(productId);
        if (!allPaymentsByProductId) {
            throw new HttpError(404, "Payments could not be fetched with this product id!");
        }

        const payments = await Promise.all(
            allPaymentsByProductId.map(async (payment) => {
                return {
                    _id: payment._id.toString(),
                    orderId: payment.orderId.toString(),
                    transactionId: payment.transactionId.toString(),
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt
                };
            })
        );

        const response: AllPaymentsResponseDtoType = {
            success: true,
            message: "All payments with this product id fetched successfully.",
            status: 200,
            data: payments
        };
        return response;
    };

    findAllPaymentsByBuyerId = async (buyerId: string): Promise<AllPaymentsResponseDtoType> => {
        const allPaymentsByBuyerId = await this.paymentRepo.findAllPaymentsByBuyerId(buyerId);
        if (!allPaymentsByBuyerId) {
            throw new HttpError(404, "Payments could not be fetched with this buyer id!");
        }

        const payments = await Promise.all(
            allPaymentsByBuyerId.map(async (payment) => {
                return {
                    _id: payment._id.toString(),
                    orderId: payment.orderId.toString(),
                    transactionId: payment.transactionId.toString(),
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt
                };
            })
        );

        const response: AllPaymentsResponseDtoType = {
            success: true,
            message: "All payments with this buyer id fetched successfully.",
            status: 200,
            data: payments
        };
        return response;
    };

    findAllPaymentsBySellerId = async (sellerId: string): Promise<AllPaymentsResponseDtoType> => {
        const allPaymentsBySellerId = await this.paymentRepo.findAllPaymentsBySellerId(sellerId);
        if (!allPaymentsBySellerId) {
            throw new HttpError(404, "Payments could not be fetched with this seller id!");
        }

        const payments = await Promise.all(
            allPaymentsBySellerId.map(async (payment) => {
                return {
                    _id: payment._id.toString(),
                    orderId: payment.orderId.toString(),
                    transactionId: payment.transactionId.toString(),
                    amount: payment.amount,
                    method: payment.method,
                    status: payment.status,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt
                };
            })
        );

        const response: AllPaymentsResponseDtoType = {
            success: true,
            message: "All payments with this seller id fetched successfully.",
            status: 200,
            data: payments
        };
        return response;
    };
}