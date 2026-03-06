// src/routes/order.route.ts
import express from "express";
import { OrderRepository } from "./../repositories/order.repository.ts";
import { OrderService } from "./../services/order.service.ts";
import { OrderController } from "./../controllers/order.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { BuyerRepository } from "./../repositories/buyer.repository.ts";
import { BuyerAuthMiddleware } from "./../middleware/auth.middleware.ts";


const orderRepo = new OrderRepository();
const orderService = new OrderService(orderRepo);
const orderController = new OrderController(orderService);

const userRepo = new UserRepository();
const buyerRepo = new BuyerRepository();
const buyerAuthMiddleware = new BuyerAuthMiddleware(userRepo, buyerRepo);

const router = express.Router();

router.post("/create-order", buyerAuthMiddleware.protect, orderController.createOrder);
router.put("/update-order-details/:id", buyerAuthMiddleware.protect, orderController.updateOrderDetails);
router.put("/update-order-status/:id", buyerAuthMiddleware.protect, orderController.updateOrderStatus);
router.get("/get-all-orders", orderController.getAllOrders);
router.get("/get-all-orders/:productId", orderController.findAllOrdersByProductId);
router.get("/get-all-orders/:buyerId", orderController.findAllOrdersByBuyerId);
router.get("/get-all-orders/:sellerId", orderController.findAllOrdersBySellerId);

// Get Order By ID Dynamic Route
router.get("/:id", orderController.getOrderById);

export default router;