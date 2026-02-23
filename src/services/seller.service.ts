// src/services/existingSellerByBaseUserId.service.ts
import type { AllSellersResponseDtoType, SellerResponseDtoType, UpdateSellerProfileDetailsDtoType, UploadImageSellerResponseDtoType } from "./../dtos/seller.dto.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { processDeleteUpload, processSingleUpload } from "./../utils/upload-media.util.ts";


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

    uploadProfilePicture = async (userId: string, profilePicture: Express.Multer.File, imageSubFolder?: string): Promise<UploadImageSellerResponseDtoType> => {
        if (!profilePicture) {
            throw new HttpError(400, "No file provided! Upload a file.");
        }

        if (!profilePicture.mimetype.startsWith("image/")) {
            throw new HttpError(400, "Only image files are allowed!");
        }

        const existingSellerById = await this.sellerRepo.findSellerById(userId);
        if (!existingSellerById) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const imageUrl = await processSingleUpload(profilePicture, imageSubFolder || "profile-pictures/sellers");

        const updatedSeller = await this.sellerRepo.updateSeller(existingSellerById._id.toString(), {
            profilePictureUrl: imageUrl
        });

        if (!updatedSeller || !updatedSeller.profilePictureUrl) {
            if (profilePicture) {
                await processDeleteUpload(imageUrl);
            }
            throw new HttpError(404, "Seller is not found along with profile picture!");
        }

        if (existingSellerById.profilePictureUrl) {
            await processDeleteUpload(existingSellerById.profilePictureUrl);
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

        const existingSellerById = await this.sellerRepo.findSellerById(sellerId);
        if (!existingSellerById) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const deletedSeller = await this.sellerRepo.deleteSeller(decodedSellerId);
        if (!deletedSeller) {
            throw new HttpError(400, "Seller account not deleted!");
        }

        if (existingSellerById.profilePictureUrl) {
            await processDeleteUpload(existingSellerById.profilePictureUrl);
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller account deleted profile successfully.",
            status: 200
        };
        return response;
    }

    getAllSellers = async (): Promise<AllSellersResponseDtoType | null> => {
        const sellers = await this.sellerRepo.getAllSellers();
        if (!sellers) {
            throw new HttpError(404, "Sellers could not be fetched!");
        }

        const users = await Promise.all(
            sellers.map(async (seller) => {
                const baseUser = seller.baseUserId
                    ? await this.userRepo.findUserById(seller.baseUserId.toString())
                    : null;

                if (!baseUser) {
                    throw new HttpError(404, `Base user not found for seller ID: ${seller._id.toString()}`);
                }

                return {
                    _id: seller._id.toString(),
                    email: baseUser.email,
                    role: baseUser.role,
                    isVerified: Boolean(baseUser.isVerified),
                    baseUserId: seller.baseUserId.toString() ?? baseUser._id.toString(),
                    fullName: seller.fullName,
                    contact: seller.contact,
                    isPermanentlyBanned: Boolean(baseUser.isPermanentlyBanned),
                    profilePictureUrl: seller.profilePictureUrl,
                    bio: seller.bio,
                    createdAt: seller.createdAt ?? new Date(seller.createdAt),
                    updatedAt: seller.updatedAt ?? new Date(seller.updatedAt),
                };
            })
        );

        const respose: AllSellersResponseDtoType = {
            success: true,
            message: "All sellers fetched successfully.",
            status: 200,
            users: users
        };
        return respose;
    };

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
                profilePictureUrl: existingSellerByBaseUserId.profilePictureUrl,
                bio: existingSellerByBaseUserId.bio,
                isPermanentlyBanned: exisitingBaseUserByEmail.isPermanentlyBanned,
            }
        };
        return response;
    };
}