// src/services/existingSellerByBaseUserId.service.ts
import type { SellerResponseDtoType, UpdateSellerProfileDetailsDtoType, UploadImageSellerResponseDtoType, UploadSellerProfilePictureDtoType } from "./../dtos/seller.dto.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { uploadImage } from "./../middleware/upload-image.middleware.ts";


export class SellerService {
    private userRepo: UserRepositoryInterface;
    private sellerRepo: SellerRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        sellerRepo: SellerRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.sellerRepo = sellerRepo;
    }

    getCurrentSellerUser = async (sellerId: string): Promise<SellerResponseDtoType> => {
        if (!sellerId || sellerId.trim() === "") {
            throw new HttpError(400, "Seller id is required!");
        }

        const decodedSellerId = decodeURIComponent(sellerId);
        const existingSellerById = await this.sellerRepo.findSellerById(decodedSellerId);
        if (!existingSellerById) {
            throw new HttpError(404, "Seller with this id not found!");
        }

        const exisitingBaseUserByBaseUserId = await this.userRepo.findUserById(existingSellerById.baseUserId.toString());
        if (!exisitingBaseUserByBaseUserId) {
            throw new HttpError(404, "Base user with this user id not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller profile details updated successfully.",
            status: 200,
            user: {
                _id: existingSellerById._id.toString(),
                baseUserId: existingSellerById.baseUserId.toString() || exisitingBaseUserByBaseUserId._id.toString(),
                email: exisitingBaseUserByBaseUserId.email,
                fullName: existingSellerById.fullName,
                contact: existingSellerById.contact,
                role: exisitingBaseUserByBaseUserId.role,
                isVerified: exisitingBaseUserByBaseUserId.isVerified,
                profilePictureUrl: existingSellerById.profilePictureUrl,
                isPermanentlyBanned: exisitingBaseUserByBaseUserId.isPermanentlyBanned,
            }
        };
        return response;
    };

    updateSellerProfileDetails = async (sellerId: string, updateSellerProfileDetailsDto: UpdateSellerProfileDetailsDtoType): Promise<SellerResponseDtoType> => {
        const { fullName, contact, email, bio } = updateSellerProfileDetailsDto;

        const existingSellerById = await this.sellerRepo.findSellerById(sellerId);
        if (!existingSellerById) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const existingBaseUserByBaseUserId = await this.userRepo.findUserById(existingSellerById.baseUserId.toString());
        if (!existingBaseUserByBaseUserId) {
            throw new HttpError(404, "Base with base user id not found!");
        }

        // Changing email
        let existingSellerByEmail;
        if (existingBaseUserByBaseUserId.email !== email) {
            existingSellerByEmail = await this.sellerRepo.findSellerByEmail(email);
            if (existingSellerByEmail && (existingSellerByEmail._id.toString() !== sellerId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Email already registered!");
            }
        }

        // Changing contact or phone number
        let existingSellerByContact;
        if (existingSellerById.contact !== contact) {
            existingSellerByContact = await this.sellerRepo.findSellerByContact(contact);
            if (existingSellerByContact && (existingSellerByContact._id.toString() !== sellerId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Contact already exists!");
            }
        }

        const updatedSeller = await this.sellerRepo.updateSeller(existingSellerById._id.toString(), {
            fullName,
            contact,
            bio
        });

        if (!updatedSeller) {
            throw new HttpError(404, "Seller is not updated and not found!");
        }

        const updateBaseUser = await this.userRepo.updateUser(existingSellerById.baseUserId.toString(), { email });
        if (!updateBaseUser) {
            throw new HttpError(404, "Base user is not updated and not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller profile details updated successfully.",
            status: 200,
            user: {
                _id: updatedSeller._id.toString(),
                baseUserId: updatedSeller.baseUserId.toString() ?? updateBaseUser._id.toString(),
                email: updateBaseUser.email,
                fullName: updatedSeller.fullName,
                contact: updatedSeller.contact,
                role: updateBaseUser.role,
                isVerified: updateBaseUser.isVerified,
                profilePictureUrl: updatedSeller.profilePictureUrl,
                isPermanentlyBanned: updateBaseUser.isPermanentlyBanned,
            }
        };
        return response;
    };

    uploadProfilePicture = async (userId: string, uploadSellerProfilePictureDto: UploadSellerProfilePictureDtoType): Promise<UploadImageSellerResponseDtoType> => {
        const { profilePicture } = uploadSellerProfilePictureDto;

        const existingSellerById = await this.sellerRepo.findSellerById(userId);
        if (!existingSellerById) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const arrayBuffer = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageUrl = await uploadImage(buffer, profilePicture.name, "leelame/profile-pictures/sellers");

        const updatedSeller = await this.sellerRepo.updateSeller(existingSellerById._id.toString(), {
            profilePictureUrl: imageUrl
        });

        if (!updatedSeller || !updatedSeller.profilePictureUrl) {
            throw new HttpError(404, "Seller is not found along with profile picture!");
        }

        const response: UploadImageSellerResponseDtoType = {
            success: true,
            message: "Seller profile picture uploaded successfully.",
            status: 200,
            data: {
                imageUrl: updatedSeller.profilePictureUrl
            }
        };
        return response;
    };

    deleteSellerAccount = async (sellerId: string): Promise<SellerResponseDtoType | null> => {
        if (!sellerId || sellerId.trim() === "") {
            throw new HttpError(400, "Seller id is required!");
        }

        const decodedSellerId = decodeURIComponent(sellerId);
        const deletedSeller = await this.sellerRepo.deleteSeller(decodedSellerId);
        if (!deletedSeller) {
            throw new HttpError(400, "Seller account not deleted!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller account deleted profile successfully.",
            status: 200
        };
        return response;
    }

    getSellerByEmail = async (email: string): Promise<SellerResponseDtoType | null> => {
        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        // Check existing user
        const decodedEmail = decodeURIComponent(email);
        const exisitingBaseUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!exisitingBaseUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        // const existingSellerByBaseUserId = await this.sellerRepo.findSellerByEmail(decodedEmail);
        const existingSellerByBaseUserId = await this.sellerRepo.findSellerByBaseUserId(exisitingBaseUserByEmail._id.toString());
        if (!existingSellerByBaseUserId) {
            throw new HttpError(404, "Seller with this base user id not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller with this email successfully fetched.",
            status: 200,
            user: {
                _id: existingSellerByBaseUserId._id.toString(),
                email: exisitingBaseUserByEmail.email,
                role: exisitingBaseUserByEmail.role,
                isVerified: exisitingBaseUserByEmail.isVerified,
                baseUserId: existingSellerByBaseUserId.baseUserId.toString() || exisitingBaseUserByEmail._id.toString(),
                fullName: existingSellerByBaseUserId.fullName,
                contact: existingSellerByBaseUserId.contact,
                profilePictureUrl: exisitingBaseUserByEmail.profilePictureUrl,
                bio: existingSellerByBaseUserId.bio,
                isPermanentlyBanned: exisitingBaseUserByEmail.isPermanentlyBanned,
            }
        };
        return response;
    };
}