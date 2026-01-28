// src/repositories/admin.repository.ts
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import type { Admin, AdminDocument } from "./../types/admin.type.ts";
import AdminModel from "./../models/admin.model.ts";
import UserModel from "./../models/user.model.ts";


export class AdminRepository implements AdminRepositoryInterface {
    createAdmin = async (admin: Admin): Promise<AdminDocument | null> => {
        const newAdmin = await AdminModel.create(admin);
        return newAdmin;
    };

    updateAdmin = async (id: string, admin: Partial<Admin>): Promise<AdminDocument | null> => {
        const updatedAdmin = await AdminModel.findByIdAndUpdate(id, admin, { new: true }).lean();
        return updatedAdmin;
    };

    deleteAdmin = async (id: string): Promise<void | null> => {
        await AdminModel.findByIdAndDelete(id);
    };

    findAdminById = async (id: string): Promise<AdminDocument | null> => {
        const admin = await AdminModel.findById(id).lean();
        return admin;
    };

    findAdminByBaseUserId = async (baseUserId: string): Promise<AdminDocument | null> => {
        const admin = await AdminModel.findOne({ baseUserId: baseUserId }).lean();
        // const admin = await AdminModel.findOne({ userId: new Types.ObjectId(userId) } as any).lean();
        return admin;
    };

    findAdminByEmail = async (email: string): Promise<AdminDocument | null> => {
        const baseUser = await UserModel.findOne({ email }).lean();
        if (!baseUser) {
            return null;
        }
        const admin = await this.findAdminByBaseUserId(baseUser._id.toString());
        return admin;
    };

    findAdminByContact = async (contact: string): Promise<AdminDocument | null> => {
        const seller = await AdminModel.findOne({ contact }).lean();
        return seller;
    };

    getAllAdmins = async (): Promise<AdminDocument[] | null> => {
        const admins = await AdminModel.find().lean();
        return admins;
    };
}
