// src/repositories/admin.repository.ts
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import type { Admin, AdminDocument } from "./../types/admin.type.ts";
import AdminModel from "./../models/admin.model.ts";
import UserModel from "./../models/user.model.ts";
// import type { ClientSession } from "mongoose";


export class AdminRepository implements AdminRepositoryInterface {
    createAdmin = async (admin: Admin): Promise<AdminDocument | null> => {
        const newAdmin = await AdminModel.create(admin);
        return newAdmin;
    };

    updateAdmin = async (id: string, admin: Partial<Admin>): Promise<AdminDocument | null> => {
        const updatedAdmin = await AdminModel.findByIdAndUpdate(id, admin, { new: true }).lean();
        return updatedAdmin;
    };

    deleteAdmin = async (id: string): Promise<Boolean> => {
        const admin = await this.findAdminById(id);
        if (!admin) {
            return false;
        }

        await AdminModel.findByIdAndDelete(id);
        await UserModel.findByIdAndDelete(admin.baseUserId.toString());

        const deletedAdmin = await this.findAdminById(id);
        const deletedBaseUser = await UserModel.findById(admin.baseUserId.toString()).lean();

        if (deletedAdmin || deletedBaseUser) {
            return false;
        }
        return true;
    };

    findAdminById = async (id: string): Promise<AdminDocument | null> => {
        const admin = await AdminModel.findById(id).lean();
        return admin;
    };

    findAdminByBaseUserId = async (baseUserId: string): Promise<AdminDocument | null> => {
        const admin = await AdminModel.findOne({ baseUserId: baseUserId }).lean();
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
        const admin = await AdminModel.findOne({ contact }).lean();
        return admin;
    };

    getAllAdmins = async (): Promise<AdminDocument[] | null> => {
        const admins = await AdminModel.find().lean();
        return admins;
    };


    // createAdmin = async (admin: Admin): Promise<AdminDocument | null> => {
    //     const session = options?.session ?? null;
    //     let newAdmin;
    //     if (session) {
    //         newAdmin = await new AdminModel(admin).save({ session });
    //         return newAdmin;
    //     }

    //     newAdmin = await AdminModel.create(admin);
    //     return newAdmin;
    // };

    // updateAdmin = async (id: string, admin: Partial<Admin>): Promise<AdminDocument | null> => {
    //     const session = options?.session ?? null;
    //     let query = AdminModel.findByIdAndUpdate(id, admin, { new: true });
    //     if (session) {
    //         query = query.session(session);
    //     }
    //     const updatedAdmin = await query.lean();
    //     return updatedAdmin;
    // };

    // deleteAdmin = async (id: string): Promise<Boolean> => {
    //     const session = options?.session ?? null;
    //     const admin = await this.findAdminById(id, { session });
    //     if (!admin) {
    //         return false;
    //     }

    //     let deleteAdminQuery = AdminModel.findByIdAndDelete(id);
    //     if (session) {
    //         deleteAdminQuery = deleteAdminQuery.session(session);
    //     }
    //     await deleteAdminQuery.exec();

    //     let deleteUserQuery = UserModel.findByIdAndDelete(admin.baseUserId.toString());
    //     if (session) {
    //         deleteUserQuery = deleteUserQuery.session(session);
    //     }
    //     await deleteUserQuery.exec();

    //     const deletedAdmin = await this.findAdminById(id, { session });

    //     let deletedBaseUserQuery = UserModel.findById(admin.baseUserId.toString());
    //     if (session) {
    //         deletedBaseUserQuery = deletedBaseUserQuery.session(session);
    //     }
    //     const deletedBaseUser = await deletedBaseUserQuery.lean();

    //     if (deletedAdmin || deletedBaseUser) {
    //         return false;
    //     }
    //     return true;
    // };

    // findAdminById = async (id: string): Promise<AdminDocument | null> => {
    //     const session = options?.session ?? null;
    //     let query = AdminModel.findById(id);
    //     if (session) {
    //         query = query.session(session);
    //     }
    //     const admin = await query.lean();
    //     return admin;
    // };

    // findAdminByBaseUserId = async (baseUserId: string): Promise<AdminDocument | null> => {
    //     const session = options?.session ?? null;
    //     let query = AdminModel.findOne({ baseUserId: baseUserId });
    //     if (session) {
    //         query = query.session(session);
    //     }
    //     const admin = await query.lean();
    //     return admin;
    // };

    // findAdminByEmail = async (email: string): Promise<AdminDocument | null> => {
    //     const session = options?.session ?? null;
    //     let query = UserModel.findOne({ email });
    //     if (session) {
    //         query = query.session(session);
    //     }
    //     const baseUser = await query.lean();
    //     if (!baseUser) {
    //         return null;
    //     }
    //     const admin = await this.findAdminByBaseUserId(baseUser._id.toString());
    //     return admin;
    // };

    // findAdminByContact = async (contact: string): Promise<AdminDocument | null> => {
    //     const session = options?.session ?? null;
    //     let query = AdminModel.findOne({ contact });
    //     if (session) {
    //         query = query.session(session);
    //     }
    //     const admin = await query.lean();
    //     return admin;
    // };

    // getAllAdmins = async (options?: { session?: ClientSession | null }): Promise<AdminDocument[] | null> => {
    //     const session = options?.session ?? null;
    //     let query = AdminModel.find();
    //     if (session) {
    //         query = query.session(session);
    //     }
    //     const admins = await query.lean();
    //     return admins;
    // };
}