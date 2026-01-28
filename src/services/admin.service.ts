// src/services/admin.service.ts
import type { AdminResponseDtoType, GetAdminByEmailDtoType, GetAdminByIdType } from "./../dtos/admin.dto.ts";
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


export class AdminService {
    private userRepo: UserRepositoryInterface;
    private adminRepo: AdminRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        adminRepo: AdminRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
    }

    getCurrentAdminUser = async (adminId: string): Promise<AdminResponseDtoType> => {
        const existingAdminById = await this.adminRepo.findAdminById(adminId);
        if (!existingAdminById) {
            throw new HttpError(404, "Admin with this id not found!");
        }

        const exisitingBaseUserByBaseUserId = await this.userRepo.findUserById(existingAdminById.baseUserId.toString());
        if (!exisitingBaseUserByBaseUserId) {
            throw new HttpError(404, "Base user with this user id not found!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Admin profile details updated successfully.",
            status: 200,
            user: {
                _id: existingAdminById._id.toString(),
                email: exisitingBaseUserByBaseUserId.email,
                role: exisitingBaseUserByBaseUserId.role,
                isVerified: exisitingBaseUserByBaseUserId.isVerified,
                baseUserId: existingAdminById.baseUserId.toString() || exisitingBaseUserByBaseUserId._id.toString(),
                fullName: existingAdminById.fullName,
                contact: existingAdminById.contact,
                profilePictureUrl: existingAdminById.profilePictureUrl,
                isPermanentlyBanned: exisitingBaseUserByBaseUserId.isPermanentlyBanned,
            }
        };
        return response;
    };

    getAdminByEmail = async (getAdminByEmailDto: GetAdminByEmailDtoType): Promise<AdminResponseDtoType | null> => {
        const { email } = getAdminByEmailDto;

        if (!email || email.trim() === '') {
            throw new HttpError(400, "Email is required!");
        }

        // Check existing user
        const decodedEmail = decodeURIComponent(email);
        const exisitingBaseUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!exisitingBaseUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        // const admin = await this.adminRepo.findAdminByEmail(decodedEmail);
        const existingAdminByBaseUserId = await this.adminRepo.findAdminByBaseUserId(exisitingBaseUserByEmail._id.toString());
        if (!existingAdminByBaseUserId) {
            throw new HttpError(404, "Admin with this base user id not found!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Admin with this email successfully fetched.",
            status: 200,
            user: {
                _id: existingAdminByBaseUserId._id.toString(),
                email: exisitingBaseUserByEmail.email,
                role: exisitingBaseUserByEmail.role,
                isVerified: exisitingBaseUserByEmail.isVerified,
                baseUserId: existingAdminByBaseUserId.baseUserId.toString() || exisitingBaseUserByEmail._id.toString(),
                fullName: existingAdminByBaseUserId.fullName,
                contact: existingAdminByBaseUserId.contact,
                profilePictureUrl: exisitingBaseUserByEmail.profilePictureUrl,
                isPermanentlyBanned: exisitingBaseUserByEmail.isPermanentlyBanned,
            }
        };
        return response;
    };

    getAdminById = async (getAdminByIdDto: GetAdminByIdType): Promise<AdminResponseDtoType | null> => {
        const { id } = getAdminByIdDto;

        if (!id || id.trim() === '') {
            throw new HttpError(400, "Admin id is required!");
        }

        const decodedAdminId = decodeURIComponent(id);
        const exisitingAdminById = await this.adminRepo.findAdminById(decodedAdminId);

        if (!exisitingAdminById) {
            throw new HttpError(404, "Admin with this id not found!");
        }

        // Check existing user
        const exisitingBaseUserByBaseUserId = await this.userRepo.findUserById(exisitingAdminById.baseUserId.toString());
        if (!exisitingBaseUserByBaseUserId) {
            throw new HttpError(404, "User with this id not found!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Admin with this id successfully fetched.",
            status: 200,
            user: {
                _id: exisitingAdminById._id.toString(),
                email: exisitingBaseUserByBaseUserId.email,
                role: exisitingBaseUserByBaseUserId.role,
                isVerified: exisitingBaseUserByBaseUserId.isVerified,
                baseUserId: exisitingAdminById.baseUserId.toString() || exisitingBaseUserByBaseUserId._id.toString(),
                fullName: exisitingAdminById.fullName,
                contact: exisitingAdminById.contact,
                profilePictureUrl: exisitingBaseUserByBaseUserId.profilePictureUrl,
                isPermanentlyBanned: exisitingBaseUserByBaseUserId.isPermanentlyBanned,
            }
        };
        return response;
    };
}