// src/routes/admin.route.ts
import express from "express";
import { UserRepository } from "./../repositories/user.repository.ts";
import { AdminRepository } from "./../repositories/admin.repository.ts";
import { AdminAuthService } from "./../services/auth/admin-auth.service.ts";
import { AdminAuthController } from "./../controllers/auth/admin-auth.controller.ts";
import { AdminService } from "./../services/admin.service.ts";
import { AdminController } from "./../controllers/admin.controller.ts";
import { AdminAuthMiddleware } from "./../middleware/auth.middleware.ts";


const userRepo = new UserRepository();
const adminRepo = new AdminRepository();
const adminAuthService = new AdminAuthService(userRepo, adminRepo);
const adminAuthController = new AdminAuthController(adminAuthService);

const adminService = new AdminService(userRepo, adminRepo);
const adminController = new AdminController(adminService);

const adminAuthMiddleware = new AdminAuthMiddleware(userRepo, adminRepo);

const router = express.Router();

// Admin Authentication
router.post("/sign-up", adminAuthController.createAdmin);
router.put("/verify-account/registration", adminAuthController.verifyOtpForRegistration);

router.post("/login", adminAuthController.loginAdmin);
router.put("/send-verification-email-registration", adminAuthController.handleSendEmailForRegistration);

router.put("/forgot-password", adminAuthController.forgotPassword);
router.put("/verify-account/reset-password", adminAuthController.verifyOtpForResetPassword);
router.put("/reset-password", adminAuthController.resetPassword);


router.get("/logout", adminAuthMiddleware.protect, adminAuthController.logoutAdmin);

// Admin Other CRUDs
router.get("/:id", adminAuthMiddleware.protect, adminController.getAdminById);
router.get("/:email", adminAuthMiddleware.protect, adminController.getAdminByEmail);
// router.get("/:id", getStudentById);

export default router;