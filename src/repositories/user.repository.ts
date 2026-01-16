// src/repositories/user.repository.ts
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import type { User, UserDocument } from "./../types/user.type.ts";
import UserModel from "./../models/user.model.ts";


export class UserRepository implements UserRepositoryInterface {
    createUser = async (user: User): Promise<UserDocument | null> => {
        const newUser = await UserModel.create(user);
        return newUser;
    };

    updateUser = async (id: string, user: Partial<User>): Promise<UserDocument | null> => {
        const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true }).lean();
        return updatedUser;
    };

    deleteUser = async (id: string): Promise<void | null> => {
        await UserModel.findByIdAndDelete(id);
    };

    findUserByEmail = async (email: string): Promise<UserDocument | null> => {
        const user = await UserModel.findOne({ email }).lean();
        return user;
    };

    findUserById = async (id: string): Promise<UserDocument | null> => {
        const user = await UserModel.findById(id).lean();
        // const user = await UserModel.findOne({ _id: id }).lean();
        return user;
    };

    getAllUsers = async (): Promise<UserDocument[] | null> => {
        const users = await UserModel.find().lean();
        return users;
    };
}