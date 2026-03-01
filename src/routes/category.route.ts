// src/routes/category.route.ts
import express from "express";
import { CategoryRepository } from "./../repositories/category.repository.ts";
import { CategoryService } from "./../services/category.service.ts";
import { CategoryController } from "./../controllers/category.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { AdminRepository } from "./../repositories/admin.repository.ts";
import { AdminAuthMiddleware } from "./../middleware/auth.middleware.ts";


const categoryRepo = new CategoryRepository();
const categoryService = new CategoryService(categoryRepo);
const categoryController = new CategoryController(categoryService);

const userRepo = new UserRepository();
const adminRepo = new AdminRepository();
const adminAuthMiddleware = new AdminAuthMiddleware(userRepo, adminRepo);

const router = express.Router();

router.post("/create-category", adminAuthMiddleware.protect, categoryController.createCategory);
router.put("/update-category-details/:id", adminAuthMiddleware.protect, categoryController.updateCategory);
router.delete("/delete-category/:id", adminAuthMiddleware.protect, categoryController.deleteCategory);
router.get("/get-all-categories", categoryController.getAllCategories);

// Get Category By ID Dynamic Route
router.get("/:id", categoryController.getCategoryById);
// router.get("/:id", adminAuthMiddleware.protect, categoryController.getCategoryById);

export default router;