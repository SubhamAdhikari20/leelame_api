// src/interfaces/category.repository.interface.ts
import type { CategoryDocument, Category } from "./../types/category.type.ts";


export interface CategoryRepositoryInterface {
    createCategory(category: Category): Promise<CategoryDocument | null>;
    updateCategory(id: string, category: Partial<Category>): Promise<CategoryDocument | null>;
    deleteCategory(id: string): Promise<boolean>;
    findCategoryById(id: string): Promise<CategoryDocument | null>;
    findCategoryByCategoryName(categoryName: string): Promise<CategoryDocument | null>;
    getAllCategories(): Promise<CategoryDocument[] | null>;
}