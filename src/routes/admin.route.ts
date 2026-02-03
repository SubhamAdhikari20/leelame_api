// src/routes/admin.route.ts
import express from "express";
import { UserRepository } from "./../repositories/user.repository.ts";
import { AdminRepository } from "./../repositories/admin.repository.ts";
import { AdminAuthService } from "./../services/auth/admin-auth.service.ts";
import { AdminAuthController } from "./../controllers/auth/admin-auth.controller.ts";
import { AdminService } from "./../services/admin.service.ts";
import { AdminController } from "./../controllers/admin.controller.ts";
import { AdminAuthMiddleware } from "./../middleware/auth.middleware.ts";
import { SellerRepository } from "./../repositories/seller.repository.ts";
import { upload } from "./../middleware/upload.middleware.ts";


const userRepo = new UserRepository();
const adminRepo = new AdminRepository();
const adminAuthService = new AdminAuthService(userRepo, adminRepo);
const adminAuthController = new AdminAuthController(adminAuthService);

// seller routes for admin
const sellerRepo = new SellerRepository();

const adminService = new AdminService(userRepo, adminRepo, sellerRepo);
const adminController = new AdminController(adminService);

const adminAuthMiddleware = new AdminAuthMiddleware(userRepo, adminRepo);

const router = express.Router();

// Admin Authentication
router.post("/sign-up", adminAuthController.createAdmin);
router.put("/verify-account-registration", adminAuthController.verifyOtpForRegistration);

router.post("/login", adminAuthController.loginAdmin);
router.put("/send-verification-email-registration", adminAuthController.handleSendEmailForRegistration);

router.put("/forgot-password", adminAuthController.forgotPassword);
router.put("/verify-account-reset-password", adminAuthController.verifyOtpForResetPassword);
router.put("/reset-password", adminAuthController.resetPassword);

router.get("/logout", adminAuthMiddleware.protect, adminController.logoutAdmin);

// Admin Other CRUDs
router.put("/update-profile-details/:id", adminAuthMiddleware.protect, adminController.updateAdminProfileDetails);
router.put("/upload-profile-picture/:id", adminAuthMiddleware.protect, upload.single("profilePicture"), adminController.uploadProfilePicture);
router.delete("/delete-account/:id", adminAuthMiddleware.protect, adminController.deleteAdminAccount);

// Seller CRUDs by admin
router.post("/create-seller-account", adminAuthMiddleware.protect, upload.single("profile-picture-seller"), adminController.createSellerAccount);
// router.put("/update-seller-details/:sellerId", adminAuthMiddleware.protect, adminController.updateAdminProfileDetails);
router.get("/get-all-sellers", adminAuthMiddleware.protect, adminController.getAllSellers);
router.delete("/delete-seller-account/:sellerId", adminAuthMiddleware.protect, adminController.deleteSellerAccount);

// Get Current Admin Dynamic Route
router.get("/:id", adminAuthMiddleware.protect, adminController.getCurrentAdmin);

export default router;