// src/routes/seller.route.ts
import express from "express";
import { UserRepository } from "./../repositories/user.repository.ts";
import { SellerRepository } from "./../repositories/seller.repository.ts";
import { SellerAuthService } from "./../services/auth/seller-auth.service.ts";
import { SellerAuthController } from "./../controllers/auth/seller-auth.controller.ts";
import { SellerService } from "./../services/seller.service.ts";
import { SellerController } from "./../controllers/seller.controller.ts";
import { SellerAuthMiddleware } from "./../middleware/auth.middleware.ts";


const userRepo = new UserRepository();
const sellerRepo = new SellerRepository();
const sellerAuthService = new SellerAuthService(userRepo, sellerRepo);
const sellerAuthController = new SellerAuthController(sellerAuthService);

const sellerService = new SellerService(userRepo, sellerRepo);
const sellerController = new SellerController(sellerService);

const sellerAuthMiddleware = new SellerAuthMiddleware(userRepo, sellerRepo);

const router = express.Router();

// Seller Authentication
router.post("/sign-up", sellerAuthController.createSeller);
router.put("/verify-account-registration", sellerAuthController.verifyOtpForRegistration);

router.post("/login", sellerAuthController.loginSeller);
router.put("/send-verification-email-registration", sellerAuthController.handleSendEmailForRegistration);

router.put("/forgot-password", sellerAuthController.forgotPassword);
router.put("/reset-password", sellerAuthController.resetPassword);

router.get("/logout", sellerAuthMiddleware.protect, sellerAuthController.logoutSeller);

// Seller Other CRUDs
router.get("/:id", sellerAuthMiddleware.protect, sellerController.getSellerById);
router.get("/:email", sellerAuthMiddleware.protect, sellerController.getSellerByEmail);
// router.get("/:id", getStudentById);

export default router;