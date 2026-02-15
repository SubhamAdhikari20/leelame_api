// src/repositories/category.repository.ts
import type { CategoryRepositoryInterface } from "./../interfaces/category.repository.interface.ts";
import type { Category, CategoryDocument } from "./../types/category.type.ts";
import CategoryModel from "./../models/category.model.ts";


export class CategoryRepository implements CategoryRepositoryInterface {
    createCategory = async (category: Category): Promise<CategoryDocument | null> => {
        const newCategory = await CategoryModel.create(category);
        return newCategory;
    };

    updateCategory = async (id: string, category: Partial<Category>): Promise<CategoryDocument | null> => {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(id, category, { new: true }).lean();
        return updatedCategory;
    };

    deleteCategory = async (id: string): Promise<boolean> => {
        const deletedCategory = await CategoryModel.findByIdAndDelete(id);
        if (!deletedCategory) {
            return false;
        }

        return true;
    };

    findCategoryById = async (id: string): Promise<CategoryDocument | null> => {
        const category = await CategoryModel.findById(id).lean();
        return category;
    };

    findCategoryByCategoryName = async (categoryName: string): Promise<CategoryDocument | null> => {
        const category = await CategoryModel.findOne({ categoryName }).lean();
        return category;
    };

    getAllCategories = async (): Promise<CategoryDocument[] | null> => {
        const categories = await CategoryModel.find().lean();
        return categories;
    };
}