// src/repositories/admin.repository.ts
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import type { Admin, AdminDocument } from "./../types/admin.type.ts";
import type { ClientSession } from "mongoose";
import AdminModel from "./../models/admin.model.ts";
import UserModel from "./../models/user.model.ts";


export class AdminRepository implements AdminRepositoryInterface {
    createAdmin = async (admin: Admin, options?: { session?: ClientSession | null }): Promise<AdminDocument | null> => {
        const session = options?.session ?? null;
        const newAdmin = await new AdminModel(admin).save({ session });
        return newAdmin;
    };

    updateAdmin = async (id: string, admin: Partial<Admin>, options?: { session?: ClientSession | null }): Promise<AdminDocument | null> => {
        const session = options?.session ?? null;
        let query = AdminModel.findByIdAndUpdate(id, admin, { new: true });
        if (session) {
            query = query.session(session);
        }
        const updatedAdmin = await query.lean();
        return updatedAdmin;
    };

    deleteAdmin = async (id: string, options?: { session?: ClientSession | null }): Promise<Boolean> => {
        const session = options?.session ?? null;
        const admin = await this.findAdminById(id, { session });
        if (!admin) {
            return false;
        }

        let deleteAdminQuery = AdminModel.findByIdAndDelete(id);
        if (session) {
            deleteAdminQuery = deleteAdminQuery.session(session);
        }
        await deleteAdminQuery.exec();

        let deleteUserQuery = UserModel.findByIdAndDelete(admin.baseUserId.toString());
        if (session) {
            deleteUserQuery = deleteUserQuery.session(session);
        }
        await deleteUserQuery.exec();

        const deletedAdmin = await this.findAdminById(id, { session });

        let deletedBaseUserQuery = UserModel.findById(admin.baseUserId.toString());
        if (session) {
            deletedBaseUserQuery = deletedBaseUserQuery.session(session);
        }
        const deletedBaseUser = await deletedBaseUserQuery.lean();

        if (deletedAdmin || deletedBaseUser) {
            return false;
        }
        return true;
    };

    findAdminById = async (id: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null> => {
        const session = options?.session ?? null;
        let query = AdminModel.findById(id);
        if (session) {
            query = query.session(session);
        }
        const admin = await query.lean();
        return admin;
    };

    findAdminByBaseUserId = async (baseUserId: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null> => {
        const session = options?.session ?? null;
        let query = AdminModel.findOne({ baseUserId: baseUserId });
        if (session) {
            query = query.session(session);
        }
        const admin = await query.lean();
        return admin;
    };

    findAdminByEmail = async (email: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findOne({ email });
        if (session) {
            query = query.session(session);
        }
        const baseUser = await query.lean();
        if (!baseUser) {
            return null;
        }
        const admin = await this.findAdminByBaseUserId(baseUser._id.toString());
        return admin;
    };

    findAdminByContact = async (contact: string, options?: { session?: ClientSession | null }): Promise<AdminDocument | null> => {
        const session = options?.session ?? null;
        let query = AdminModel.findOne({ contact });
        if (session) {
            query = query.session(session);
        }
        const admin = await query.lean();
        return admin;
    };

    getAllAdmins = async (options?: { session?: ClientSession | null }): Promise<AdminDocument[] | null> => {
        const session = options?.session ?? null;
        let query = AdminModel.find();
        if (session) {
            query = query.session(session);
        }
        const admins = await query.lean();
        return admins;
    };
}
