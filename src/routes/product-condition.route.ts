// src/routes/product-condition.route.ts
import express from "express";
import { ProductConditionRepository } from "./../repositories/product-condition.repository.ts";
import { ProductConditionService } from "./../services/product-condition.service.ts";
import { ProductConditionController } from "./../controllers/product-condition.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { AdminRepository } from "./../repositories/admin.repository.ts";
import { AdminAuthMiddleware } from "./../middleware/auth.middleware.ts";


const productConditionRepo = new ProductConditionRepository();
const productConditionService = new ProductConditionService(productConditionRepo);
const productConditionController = new ProductConditionController(productConditionService);

const userRepo = new UserRepository();
const adminRepo = new AdminRepository();
const adminAuthMiddleware = new AdminAuthMiddleware(userRepo, adminRepo);

const router = express.Router();

router.post("/create-product-condition", adminAuthMiddleware.protect, productConditionController.createProductCondition);
router.put("/update-product-condition-details/:id", adminAuthMiddleware.protect, productConditionController.updateProductCondition);
router.delete("/delete-product-condition/:id", adminAuthMiddleware.protect, productConditionController.deleteProductCondition);
router.get("/get-all-product-conditions", productConditionController.getAllProductConditions);

// Get Product Condition By ID Dynamic Route
router.get("/:id", adminAuthMiddleware.protect, productConditionController.getProductConditionById);

export default router;