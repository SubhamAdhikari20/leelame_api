// src/services/category.service.ts
import type { CategoryResponseDtoType, CreateCategoryDtoType, UpdateCategoryDtoType, AllCategoriesResponseDtoType } from "./../dtos/category.dto.ts";
import type { CategoryRepositoryInterface } from "./../interfaces/category.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


export class CategoryService {
    private categoryRepo: CategoryRepositoryInterface;

    constructor(categoryRepo: CategoryRepositoryInterface) {
        this.categoryRepo = categoryRepo;
    }

    createCategory = async (createCategoryData: CreateCategoryDtoType): Promise<CategoryResponseDtoType> => {
        const { categoryName, description, categoryStatus } = createCategoryData;

        const existingCategoryByCategoryName = await this.categoryRepo.findCategoryByCategoryName(categoryName);
        if (existingCategoryByCategoryName) {
            throw new HttpError(409, "Category already exists!");
        }

        const newCategory = await this.categoryRepo.createCategory({
            categoryName: categoryName,
            description: description,
            categoryStatus: categoryStatus
        });

        if (!newCategory) {
            throw new HttpError(400, "Category is not created!");
        }

        const respose: CategoryResponseDtoType = {
            success: true,
            message: "Category created successfully.",
            status: 201,
            data: {
                _id: newCategory._id.toString(),
                categoryName: newCategory.categoryName,
                description: newCategory.description,
                categoryStatus: newCategory.categoryStatus,
            }
        };
        return respose;
    };

    updateCategory = async (categoryId: string, updateCategoryData: UpdateCategoryDtoType): Promise<CategoryResponseDtoType> => {
        const { categoryName, description, categoryStatus } = updateCategoryData;

        const decodedCategoryId = decodeURIComponent(categoryId);
        const existingCategoryById = await this.categoryRepo.findCategoryById(decodedCategoryId);
        if (!existingCategoryById) {
            throw new HttpError(404, "Category with the category id not found!");
        }

        const updateCategory = await this.categoryRepo.updateCategory(existingCategoryById._id.toString(), {
            categoryName: categoryName,
            description: description,
            categoryStatus: categoryStatus
        });

        if (!updateCategory) {
            throw new HttpError(400, "Category is not updated!");
        }

        const respose: CategoryResponseDtoType = {
            success: true,
            message: "Category updated successfully.",
            status: 201,
            data: {
                _id: updateCategory._id.toString(),
                categoryName: updateCategory.categoryName,
                description: updateCategory.description,
                categoryStatus: updateCategory.categoryStatus,
            }
        };
        return respose;
    };

    deleteCategory = async (categoryId: string): Promise<CategoryResponseDtoType> => {
        const decodedCategoryId = decodeURIComponent(categoryId);
        const deletedCategory = await this.categoryRepo.deleteCategory(decodedCategoryId);
        if (!deletedCategory) {
            throw new HttpError(400, "Category is not deleted!");
        }

        const response: CategoryResponseDtoType = {
            success: true,
            message: "Category deleted successfully.",
            status: 200
        };
        return response;
    };

    getCategoryById = async (categoryId: string): Promise<CategoryResponseDtoType> => {
        const decodedCategoryId = decodeURIComponent(categoryId);
        const existingCategoryById = await this.categoryRepo.findCategoryById(decodedCategoryId);
        if (!existingCategoryById) {
            throw new HttpError(404, "Category with this id not found!");
        }

        const response: CategoryResponseDtoType = {
            success: true,
            message: "Category profile details updated successfully.",
            status: 200,
            data: {
                _id: existingCategoryById._id.toString(),
                categoryName: existingCategoryById.categoryName,
                description: existingCategoryById.description,
                categoryStatus: existingCategoryById.categoryStatus,
            }
        };
        return response;
    };

    getAllCategories = async (): Promise<AllCategoriesResponseDtoType> => {
        const allCategories = await this.categoryRepo.getAllCategories();
        if (!allCategories) {
            throw new HttpError(404, "Categories could not be fetched!");
        }

        const categories = await Promise.all(
            allCategories.map(async (category) => {
                return {
                    _id: category._id.toString(),
                    categoryName: category.categoryName,
                    description: category.description,
                    categoryStatus: category.categoryStatus,
                };
            })
        );

        const respose: AllCategoriesResponseDtoType = {
            success: true,
            message: "All categories fetched successfully.",
            status: 200,
            data: categories
        };
        return respose;
    };
}