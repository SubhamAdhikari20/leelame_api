// src/routes/product.route.ts
import express from "express";
import { ProductRepository } from "./../repositories/product.repository.ts";
import { ProductService } from "./../services/product.service.ts";
import { ProductController } from "./../controllers/product.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { SellerRepository } from "./../repositories/seller.repository.ts";
import { SellerAuthMiddleware } from "./../middleware/auth.middleware.ts";
import { upload } from "./../middleware/upload.middleware.ts";


const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);
const productController = new ProductController(productService);

const userRepo = new UserRepository();
const sellerRepo = new SellerRepository();
const sellerAuthMiddleware = new SellerAuthMiddleware(userRepo, sellerRepo);

const router = express.Router();

router.post("/create-product", sellerAuthMiddleware.protect, upload.array("product-images"), productController.createProduct);
router.put("/update-product-details/:id", sellerAuthMiddleware.protect, upload.array("product-images"), productController.updateProduct);
router.delete("/delete-product/:id", sellerAuthMiddleware.protect, productController.deleteProduct);
router.get("/get-all-products", productController.getAllProducts);
router.get("/get-all-products/:sellerId", productController.findAllProductsBySellerId);
router.get("/get-all-products/:buyerId", productController.findAllProductsByBuyerId);

// Get Product By ID Dynamic Route
router.get("/:id", productController.getProductById);

export default router;