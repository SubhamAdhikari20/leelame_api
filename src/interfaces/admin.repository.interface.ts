// src/interfaces/admin.repository.interface.ts
import type { Admin, AdminDocument } from "./../types/admin.type.ts";
import type { ClientSession } from "mongoose";


export interface AdminRepositoryInterface {
    createAdmin(admin: Admin, options?: { session?: ClientSession | null }): Promise<AdminDocument | null>;
    updateAdmin(id: string, admin: Partial<Admin>, options?: { session?: ClientSession }): Promise<AdminDocument | null>;
    deleteAdmin(id: string, options?: { session?: ClientSession | null }): Promise<Boolean>;
    findAdminById(id: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null>;
    findAdminByBaseUserId(baseUserId: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null>;
    findAdminByEmail(email: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null>;
    findAdminByContact(contact: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null>;
    getAllAdmins(options?: { session?: ClientSession | null }): Promise<AdminDocument[] | null>;
}