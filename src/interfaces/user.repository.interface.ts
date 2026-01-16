// src/interfaces/user.repository.interface.ts
import type { UserDocument, User } from "./../types/user.type.ts";


export interface UserRepositoryInterface {
    createUser(user: User): Promise<UserDocument | null>;
    updateUser(id: string, user: Partial<User>): Promise<UserDocument | null>;
    deleteUser(id: string): Promise<void | null>;
    findUserByEmail(email: string): Promise<UserDocument | null>;
    findUserById(id: string): Promise<UserDocument | null>;
    getAllUsers(): Promise<UserDocument[] | null>;
}