// src/routes/buyer.route.ts
import express from "express";
import { UserRepository } from "./../repositories/user.repository.ts";
import { BuyerRepository } from "./../repositories/buyer.repository.ts";
import { BuyerAuthService } from "./../services/auth/buyer-auth.service.ts";
import { BuyerAuthController } from "./../controllers/auth/buyer-auth.controller.ts";
import { BuyerService } from "./../services/buyer.service.ts";
import { BuyerController } from "./../controllers/buyer.controller.ts";
import { BuyerAuthMiddleware } from "./../middleware/auth.middleware.ts";


const userRepo = new UserRepository();
const buyerRepo = new BuyerRepository();
const buyerAuthService = new BuyerAuthService(userRepo, buyerRepo);
const buyerAuthController = new BuyerAuthController(buyerAuthService);

const buyerService = new BuyerService(userRepo, buyerRepo);
const buyerController = new BuyerController(buyerService);

const buyerAuthMiddleware = new BuyerAuthMiddleware(userRepo, buyerRepo);

const router = express.Router();

// Buyer Authentication
router.post("/sign-up", buyerAuthController.createBuyer);
router.get("/check-username-unique", buyerAuthController.checkUsernameUnique);
router.put("/verify-account/registration", buyerAuthController.verifyOtpForRegistration);

router.post("/login", buyerAuthController.loginBuyer);
router.put("/send-verification-email-registration", buyerAuthController.handleSendEmailForRegistration);

router.put("/forgot-password", buyerAuthController.forgotPassword);
router.put("/verify-account/reset-password", buyerAuthController.verifyOtpForResetPassword);
router.put("/reset-password", buyerAuthController.resetPassword);


router.get("/logout", buyerAuthMiddleware.protect, buyerAuthController.logoutBuyer);

// Buyer Other CRUDs
router.get("/:id", buyerAuthMiddleware.protect, buyerController.getCurrentBuyer);
router.get("/:email", buyerAuthMiddleware.protect, buyerController.getBuyerByEmail);
// router.get("/:id", getStudentById);

export default router;