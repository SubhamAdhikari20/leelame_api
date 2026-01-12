// src/routes/buyer.route.ts
import express from "express";
import { UserRepository } from "./../repositories/user.repository.ts";
import { BuyerRepository } from "./../repositories/buyer.repository.ts";
import { BuyerService } from "./../services/buyer.service.ts";
import { BuyerController } from "./../controllers/buyer.controller.ts";


const userRepo = new UserRepository();
const buyerRepo = new BuyerRepository();
const buyerService = new BuyerService(buyerRepo, userRepo);
const buyerController = new BuyerController(buyerService);

const router = express.Router();

router.post("/sign-up", buyerController.createBuyer);
router.get("/check-username-unique", buyerController.checkUsernameUnique);
router.put("/verify-account-registration", buyerController.verifyOtpForRegistration);

router.post("/login", buyerController.loginBuyer);
router.put("/send-verification-email-registration", buyerController.handleSendEmailForRegistration);

router.put("/forgot-password", buyerController.forgotPassword);
router.put("/verify-account-reset-password", buyerController.verifyOtpForResetPassword);
router.put("/reset-password", buyerController.resetPassword);

export default router;