// src/services/invoice.service.ts
import type { InvoiceResponseDtoType } from "./../dtos/invoice.dto.ts";
import type { InvoiceRepositoryInterface } from "./../interfaces/invoice.repository.interface.ts";
import type { PaymentRepositoryInterface } from "./../interfaces/payment.repository.interface.ts";
import type { ProductRepositoryInterface } from "./../interfaces/product.repository.interface.ts";
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";

export class InvoiceService {
    private invoiceRepo: InvoiceRepositoryInterface;
    private paymentRepo: PaymentRepositoryInterface;
    private productRepo: ProductRepositoryInterface;
    private buyerRepo: BuyerRepositoryInterface;
    private sellerRepo: SellerRepositoryInterface;

    constructor(
        invoiceRepo: InvoiceRepositoryInterface,
        paymentRepo: PaymentRepositoryInterface,
        productRepo: ProductRepositoryInterface,
        buyerRepo: BuyerRepositoryInterface,
        sellerRepo: SellerRepositoryInterface,
    ) {
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.productRepo = productRepo;
        this.buyerRepo = buyerRepo;
        this.sellerRepo = sellerRepo;
    }

    getInvoiceById = async (invoiceId: string): Promise<InvoiceResponseDtoType> => {
        const decodedInvoiceId = decodeURIComponent(invoiceId);
        const existingInvoiceById = await this.invoiceRepo.findInvoiceById(decodedInvoiceId);
        if (!existingInvoiceById) {
            throw new HttpError(404, "Invoice with this id not found!");
        }

        const existingPaymentByPaymentId = await this.paymentRepo.findPaymentById(existingInvoiceById.paymentId.toString());
        if (!existingPaymentByPaymentId) {
            throw new HttpError(404, "Payment with this id not found!");
        }

        const existingProductByProductId = await this.productRepo.findProductById(existingInvoiceById.productId.toString());
        if (!existingProductByProductId) {
            throw new HttpError(401, "Product with this id not found!");
        }

        const existingBuyerByBuyerId = await this.buyerRepo.findBuyerById(existingInvoiceById.buyerId.toString());
        if (!existingBuyerByBuyerId) {
            throw new HttpError(401, "Buyer with this id not found!");
        }

        const existingSellerBySellerId = await this.sellerRepo.findSellerById(existingInvoiceById.sellerId.toString());
        if (!existingSellerBySellerId) {
            throw new HttpError(401, "Seller with this id not found!");
        }

        const response: InvoiceResponseDtoType = {
            success: true,
            message: "Invoice details updated successfully.",
            status: 200,
            data: {
                _id: existingInvoiceById._id.toString(),
                buyerName: existingBuyerByBuyerId.fullName,
                buyerContact: existingBuyerByBuyerId.contact,
                sellerName: existingSellerBySellerId.fullName,
                sellerContact: existingSellerBySellerId.contact,
                productName: existingProductByProductId.productName,
                price: existingProductByProductId.currentBidPrice,
                serviceCharge: existingProductByProductId.commission,
                totalPrice: existingPaymentByPaymentId.amount,
                paymentMethod: existingPaymentByPaymentId.method,
                buyerId: existingInvoiceById.buyerId.toString(),
                sellerId: existingInvoiceById.sellerId.toString(),
                productId: existingInvoiceById.productId.toString(),
                orderId: existingInvoiceById.orderId.toString(),
                paymentId: existingInvoiceById.paymentId.toString(),
                transactionId: existingInvoiceById.transactionId.toString(),
                createdAt: existingInvoiceById.createdAt,
                updatedAt: existingInvoiceById.updatedAt,
            }
        };
        return response;
    };

    getInvoiceByTransactionId = async (transactionId: string): Promise<InvoiceResponseDtoType> => {
        const decodedTransactionId = decodeURIComponent(transactionId);
        const existingInvoiceByTransactionId = await this.invoiceRepo.findInvoiceByTransactionId(decodedTransactionId);
        if (!existingInvoiceByTransactionId) {
            throw new HttpError(404, "Invoice with this transaction id not found!");
        }

        const existingPaymentByPaymentId = await this.paymentRepo.findPaymentById(existingInvoiceByTransactionId.paymentId.toString());
        if (!existingPaymentByPaymentId) {
            throw new HttpError(404, "Payment with this id not found!");
        }

        const existingProductByProductId = await this.productRepo.findProductById(existingInvoiceByTransactionId.productId.toString());
        if (!existingProductByProductId) {
            throw new HttpError(401, "Product with this id not found!");
        }

        const existingBuyerByBuyerId = await this.buyerRepo.findBuyerById(existingInvoiceByTransactionId.buyerId.toString());
        if (!existingBuyerByBuyerId) {
            throw new HttpError(401, "Buyer with this id not found!");
        }

        const existingSellerBySellerId = await this.sellerRepo.findSellerById(existingInvoiceByTransactionId.sellerId.toString());
        if (!existingSellerBySellerId) {
            throw new HttpError(401, "Seller with this id not found!");
        }


        const response: InvoiceResponseDtoType = {
            success: true,
            message: "Invoice details updated successfully.",
            status: 200,
            data: {
                _id: existingInvoiceByTransactionId._id.toString(),
                buyerName: existingBuyerByBuyerId.fullName,
                buyerContact: existingBuyerByBuyerId.contact,
                sellerName: existingSellerBySellerId.fullName,
                sellerContact: existingSellerBySellerId.contact,
                productName: existingProductByProductId.productName,
                price: existingProductByProductId.currentBidPrice,
                serviceCharge: existingProductByProductId.commission,
                totalPrice: existingPaymentByPaymentId.amount,
                paymentMethod: existingPaymentByPaymentId.method,
                buyerId: existingInvoiceByTransactionId.buyerId.toString(),
                sellerId: existingInvoiceByTransactionId.sellerId.toString(),
                productId: existingInvoiceByTransactionId.productId.toString(),
                orderId: existingInvoiceByTransactionId.orderId.toString(),
                paymentId: existingInvoiceByTransactionId.paymentId.toString(),
                transactionId: existingInvoiceByTransactionId.transactionId.toString(),
                createdAt: existingInvoiceByTransactionId.createdAt,
                updatedAt: existingInvoiceByTransactionId.updatedAt,
            }
        };
        return response;
    };
}