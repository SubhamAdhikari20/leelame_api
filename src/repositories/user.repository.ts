// src/repositories/user.repository.ts
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import type { User, UserDocument } from "./../types/user.type.ts";
import type { ClientSession } from "mongoose";
import UserModel from "./../models/user.model.ts";


export class UserRepository implements UserRepositoryInterface {
    createUser = async (user: User, options?: { session?: ClientSession | null }): Promise<UserDocument | null> => {
        const session = options?.session ?? null;
        const newUser = await new UserModel(user).save({ session });
        return newUser;
    };

    updateUser = async (id: string, user: Partial<User>, options?: { session?: ClientSession | null }): Promise<UserDocument | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findByIdAndUpdate(id, user, { new: true });
        if (session) {
            query = query.session(session);
        }
        const updatedUser = await query.lean();
        return updatedUser;
    };

    deleteUser = async (id: string, options?: { session?: ClientSession | null }): Promise<void | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findByIdAndDelete(id);
        if (session) {
            query = query.session(session);
        }
        await query.exec();
    };

    findUserByEmail = async (email: string, options?: { session?: ClientSession | null }): Promise<UserDocument | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findOne({ email });
        if (session) {
            query = query.session(session);
        }
        const user = await query.lean();
        return user;
    };

    findUserById = async (id: string, options?: { session?: ClientSession | null }): Promise<UserDocument | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findById(id);
        if (session) {
            query = query.session(session);
        }
        const user = await query.lean();
        return user;
    };

    getAllUsers = async (options?: { session?: ClientSession | null }): Promise<UserDocument[] | null> => {
        const session = options?.session ?? null;
        let query = UserModel.find();
        if (session) {
            query = query.session(session);
        }
        const users = await query.lean();
        return users;
    };
}