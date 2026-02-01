// src/interfaces/user.repository.interface.ts
import type { UserDocument, User } from "./../types/user.type.ts";
import type { ClientSession } from "mongoose";


export interface UserRepositoryInterface {
    createUser(user: User, options?: { session?: ClientSession | null }): Promise<UserDocument | null>;
    updateUser(id: string, user: Partial<User>, options?: { session?: ClientSession | null }): Promise<UserDocument | null>;
    deleteUser(id: string, options?: { session?: ClientSession | null }): Promise<void | null>;
    findUserByEmail(email: string, options?: { session?: ClientSession | null }): Promise<UserDocument | null>;
    findUserById(id: string, options?: { session?: ClientSession | null }): Promise<UserDocument | null>;
    getAllUsers(options?: { session?: ClientSession | null }): Promise<UserDocument[] | null>;
}