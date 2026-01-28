// src/services/admin.service.ts
import type { AdminResponseDtoType, UpdateAdminProfileDetailsDtoType, UploadAdminProfilePictureDtoType, UploadImageAdminResponseDtoType } from "./../dtos/admin.dto.ts";
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { uploadImage } from "./../middleware/upload-image.middleware.ts";


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
        if (!adminId || adminId.trim() === "") {
            throw new HttpError(400, "Admin id is required!");
        }

        const decodedAdminId = decodeURIComponent(adminId);
        const existingAdminById = await this.adminRepo.findAdminById(decodedAdminId);
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

    updateAdminProfileDetails = async (adminId: string, updateAdminProfileDetailsDto: UpdateAdminProfileDetailsDtoType): Promise<AdminResponseDtoType> => {
        const { fullName, contact, email } = updateAdminProfileDetailsDto;

        const existingAdminById = await this.adminRepo.findAdminById(adminId);
        if (!existingAdminById) {
            throw new HttpError(404, "Admin with the admin id not found!");
        }

        const existingBaseUserByBaseUserId = await this.userRepo.findUserById(existingAdminById.baseUserId.toString());
        if (!existingBaseUserByBaseUserId) {
            throw new HttpError(404, "Base with base user id not found!");
        }

        // Changing email
        let existingAdminByEmail;
        if (existingBaseUserByBaseUserId.email !== email) {
            existingAdminByEmail = await this.adminRepo.findAdminByEmail(email);
            if (existingAdminByEmail && (existingAdminByEmail._id.toString() !== adminId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Email already registered!");
            }
        }

        // Changing contact or phone number
        let existingAdminByContact;
        if (existingAdminById.contact !== contact) {
            existingAdminByContact = await this.adminRepo.findAdminByContact(contact);
            if (existingAdminByContact && (existingAdminByContact._id.toString() !== adminId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Contact already exists!");
            }
        }

        const updatedAdmin = await this.adminRepo.updateAdmin(existingAdminById._id.toString(), {
            fullName,
            contact
        });

        if (!updatedAdmin) {
            throw new HttpError(404, "Admin is not updated and not found!");
        }

        const updateBaseUser = await this.userRepo.updateUser(existingAdminById.baseUserId.toString(), { email });
        if (!updateBaseUser) {
            throw new HttpError(404, "Base user is not updated and not found!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Admin profile details updated successfully.",
            status: 200,
            user: {
                _id: updatedAdmin._id.toString(),
                baseUserId: updatedAdmin.baseUserId.toString() ?? updateBaseUser._id.toString(),
                email: updateBaseUser.email,
                fullName: updatedAdmin.fullName,
                contact: updatedAdmin.contact,
                role: updateBaseUser.role,
                isVerified: updateBaseUser.isVerified,
                profilePictureUrl: updatedAdmin.profilePictureUrl,
                isPermanentlyBanned: updateBaseUser.isPermanentlyBanned,
            }
        };
        return response;
    };

    uploadProfilePicture = async (userId: string, uploadProfilePictureDto: UploadAdminProfilePictureDtoType): Promise<UploadImageAdminResponseDtoType> => {
        const { profilePicture } = uploadProfilePictureDto;

        const existingAdminById = await this.adminRepo.findAdminById(userId);
        if (!existingAdminById) {
            throw new HttpError(404, "Admin with the admin id not found!");
        }

        const arrayBuffer = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageUrl = await uploadImage(buffer, profilePicture.name, "leelame/profile-pictures/admins");

        const updatedAdmin = await this.adminRepo.updateAdmin(existingAdminById._id.toString(), {
            profilePictureUrl: imageUrl
        });

        if (!updatedAdmin || !updatedAdmin.profilePictureUrl) {
            throw new HttpError(404, "Admin is not found along with profile picture!");
        }

        const response: UploadImageAdminResponseDtoType = {
            success: true,
            message: "Admin profile picture uploaded successfully.",
            status: 200,
            data: {
                imageUrl: updatedAdmin.profilePictureUrl
            }
        };
        return response;
    };

    deleteAdminAccount = async (adminId: string): Promise<AdminResponseDtoType | null> => {
        if (!adminId || adminId.trim() === "") {
            throw new HttpError(400, "Admin id is required!");
        }

        const decodedAdminId = decodeURIComponent(adminId);
        const deletedAdmin = await this.adminRepo.deleteAdmin(decodedAdminId);
        if (!deletedAdmin) {
            throw new HttpError(400, "Admin account not deleted!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Admin account deleted profile successfully.",
            status: 200
        };
        return response;
    }

    getAdminByEmail = async (email: string): Promise<AdminResponseDtoType | null> => {
        if (!email || email.trim() === "") {
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
}