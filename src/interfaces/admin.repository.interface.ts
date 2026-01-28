// src/interfaces/admin.repository.interface.ts
import type { Admin, AdminDocument } from "./../types/admin.type.ts";


export interface AdminRepositoryInterface {
    createAdmin(admin: Admin): Promise<AdminDocument | null>;
    updateAdmin(id: string, admin: Partial<Admin>): Promise<AdminDocument | null>;
    deleteAdmin(id: string): Promise<void | null>;
    findAdminById(id: string): Promise<AdminDocument | null>;
    findAdminByBaseUserId(baseUserId: string): Promise<AdminDocument | null>;
    findAdminByEmail(email: string): Promise<AdminDocument | null>;
    findAdminByContact(contact: string): Promise<AdminDocument | null>;
    getAllAdmins(): Promise<AdminDocument[] | null>;
}