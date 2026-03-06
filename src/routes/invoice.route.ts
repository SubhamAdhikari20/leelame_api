// src/routes/payment.route.ts
import express from "express";
import { InvoiceRepository } from "./../repositories/invoice.repository.ts";
import { PaymentRepository } from "./../repositories/payment.repository.ts";
import { BuyerRepository } from "./../repositories/buyer.repository.ts";
import { SellerRepository } from "./../repositories/seller.repository.ts";
import { ProductRepository } from "./../repositories/product.repository.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { BuyerAuthMiddleware } from "./../middleware/auth.middleware.ts";
import { InvoiceService } from "./../services/invoice.service.ts";
import { InvoiceController } from "./../controllers/invoice.controller.ts";


const userRepo = new UserRepository();
const buyerRepo = new BuyerRepository();
const sellerRepo = new SellerRepository();
const paymentRepo = new PaymentRepository();
const productRepo = new ProductRepository();
const invoiceRepo = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepo, paymentRepo, productRepo, buyerRepo, sellerRepo);
const invoiceController = new InvoiceController(invoiceService);

const buyerAuthMiddleware = new BuyerAuthMiddleware(userRepo, buyerRepo);

const router = express.Router();

router.get("/get-invoice-by-transaction-id/:transactionId", invoiceController.getInvoiceByTransactionId);

// Get Invoice By ID Dynamic Route
router.get("/:id", invoiceController.getInvoiceById);

export default router;