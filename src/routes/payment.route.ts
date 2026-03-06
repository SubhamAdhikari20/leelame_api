// src/routes/payment.route.ts
import express from "express";
import { PaymentRepository } from "./../repositories/payment.repository.ts";
import { PaymentService } from "./../services/payment.service.ts";
import { PaymentController } from "./../controllers/payment.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { BuyerRepository } from "./../repositories/buyer.repository.ts";
import { SellerRepository } from "./../repositories/seller.repository.ts";
import { BuyerAuthMiddleware } from "./../middleware/auth.middleware.ts";
import { OrderRepository } from "./../repositories/order.repository.ts";
import { ProductRepository } from "./../repositories/product.repository.ts";
import { InvoiceRepository } from "./../repositories/invoice.repository.ts";


const userRepo = new UserRepository();
const buyerRepo = new BuyerRepository();
const sellerRepo = new SellerRepository();
const paymentRepo = new PaymentRepository();
const orderRepo = new OrderRepository();
const productRepo = new ProductRepository();
const invoiceRepo = new InvoiceRepository();
const paymentService = new PaymentService(paymentRepo, orderRepo, productRepo, invoiceRepo, buyerRepo, sellerRepo);
const paymentController = new PaymentController(paymentService);

const buyerAuthMiddleware = new BuyerAuthMiddleware(userRepo, buyerRepo);

const router = express.Router();

router.post("/initiate-payment", buyerAuthMiddleware.protect, paymentController.initiatePayment);
router.get("/esewa-callback", paymentController.finalizePaymentWithEsewa);
router.get("/khalti-callback", paymentController.finalizePaymentWithKhalti);
router.get("/get-all-payments", paymentController.getAllPayments);
router.get("/get-all-payments/:productId", paymentController.findAllPaymentsByProductId);
router.get("/get-all-payments/:buyerId", paymentController.findAllPaymentsByBuyerId);
router.get("/get-all-payments/:sellerId", paymentController.findAllPaymentsBySellerId);

// Get Payment By ID Dynamic Route
router.get("/:id", paymentController.getPaymentById);

export default router;