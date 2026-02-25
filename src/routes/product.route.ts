// src/routes/product.route.ts
import express from "express";
import { ProductRepository } from "./../repositories/product.repository.ts";
import { ProductService } from "./../services/product.service.ts";
import { ProductController } from "./../controllers/product.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { SellerRepository } from "./../repositories/seller.repository.ts";
import { AdminAuthMiddleware, SellerAuthMiddleware } from "./../middleware/auth.middleware.ts";
import { AdminRepository } from "./../repositories/admin.repository.ts";
import { upload } from "./../middleware/upload.middleware.ts";


const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);
const productController = new ProductController(productService);

const userRepo = new UserRepository();
const sellerRepo = new SellerRepository();
const sellerAuthMiddleware = new SellerAuthMiddleware(userRepo, sellerRepo);
const adminRepo = new AdminRepository();
const adminAuthMiddleware = new AdminAuthMiddleware(userRepo, adminRepo);

const router = express.Router();

router.post("/create-product", sellerAuthMiddleware.protect, upload.array("product-images"), productController.createProduct);
router.put("/update-product-details/:id", sellerAuthMiddleware.protect, upload.array("product-images"), productController.updateProduct);
router.delete("/delete-product/:id", sellerAuthMiddleware.protect, productController.deleteProduct);
router.get("/get-all-products", productController.getAllProducts);
router.get("/get-all-verified-products", productController.getAllVerifiedProducts);
router.get("/get-all-products/:sellerId", productController.findAllProductsBySellerId);
router.get("/get-all-verified-products/:buyerId", productController.findAllProductsByBuyerId);
router.post("/verify-product-by-admin/:id", adminAuthMiddleware.protect, productController.verifyProductByAdmin);

// Get Product By ID Dynamic Route
router.get("/:id", productController.getProductById);

export default router;