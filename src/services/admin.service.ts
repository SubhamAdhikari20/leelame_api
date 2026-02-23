// src/services/admin.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AdminResponseDtoType, UpdateAdminProfileDetailsDtoType, UploadImageAdminResponseDtoType, CreatedSellerByAdminDtoType, UpdateSellerByAdminDtoType } from "./../dtos/admin.dto.ts";
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import type { AllSellersResponseDtoType, SellerResponseDtoType } from "./../dtos/seller.dto.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { processDeleteUpload, processSingleUpload } from "./../utils/upload-media.util.ts";


export class AdminService {
    private userRepo: UserRepositoryInterface;
    private adminRepo: AdminRepositoryInterface;
    private sellerRepo: SellerRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        adminRepo: AdminRepositoryInterface,
        sellerRepo: SellerRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.sellerRepo = sellerRepo;
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
            message: "Admin data fetched successfully.",
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

    uploadProfilePicture = async (userId: string, profilePicture: Express.Multer.File, imageSubFolder?: string): Promise<UploadImageAdminResponseDtoType> => {
        if (!profilePicture) {
            throw new HttpError(400, "No file provided! Upload a file.");
        }

        if (!profilePicture.mimetype.startsWith("image/")) {
            throw new HttpError(400, "Only image files are allowed!");
        }

        const existingAdminById = await this.adminRepo.findAdminById(userId);
        if (!existingAdminById) {
            throw new HttpError(404, "Admin with the admin id not found!");
        }

        const imageUrl = await processSingleUpload(profilePicture, imageSubFolder || "profile-pictures/admins");

        const updatedAdmin = await this.adminRepo.updateAdmin(existingAdminById._id.toString(), {
            profilePictureUrl: imageUrl
        });

        if (!updatedAdmin || !updatedAdmin.profilePictureUrl) {
            if (profilePicture) {
                await processDeleteUpload(imageUrl);
            }
            throw new HttpError(404, "Admin is not found along with profile picture!");
        }

        if (existingAdminById.profilePictureUrl) {
            await processDeleteUpload(existingAdminById.profilePictureUrl);
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

        const existingAdminById = await this.adminRepo.findAdminById(adminId);
        if (!existingAdminById) {
            throw new HttpError(404, "Admin with the admin id not found!");
        }

        const deletedAdmin = await this.adminRepo.deleteAdmin(decodedAdminId);
        if (!deletedAdmin) {
            throw new HttpError(400, "Admin account not deleted!");
        }

        if (existingAdminById.profilePictureUrl) {
            await processDeleteUpload(existingAdminById.profilePictureUrl);
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Admin account deleted profile successfully.",
            status: 200
        };
        return response;
    };

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
                profilePictureUrl: existingAdminByBaseUserId.profilePictureUrl,
                isPermanentlyBanned: exisitingBaseUserByEmail.isPermanentlyBanned,
            }
        };
        return response;
    };

    logoutAdmin = async (adminId: string): Promise<AdminResponseDtoType> => {
        const adminResposne = await this.getCurrentAdminUser(adminId);

        if (!adminResposne.success) {
            const response: AdminResponseDtoType = {
                success: false,
                message: adminResposne.message,
                status: adminResposne.status ?? 400,
            };
            return response;
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Logged out successfully.",
            status: 200,
        };
        return response;
    };

    // Seller Creation
    createSellerAccount = async (sellerData: CreatedSellerByAdminDtoType, profilePicture?: Express.Multer.File, imageSubFolder?: string): Promise<SellerResponseDtoType | null> => {
        let profilePictureUrl;

        if (profilePicture) {
            if (!profilePicture.mimetype.startsWith("image/")) {
                throw new HttpError(400, "Only image files are allowed!");
            }
            profilePictureUrl = await processSingleUpload(profilePicture, imageSubFolder || "profile-pictures/sellers");
        }

        const { fullName, contact, email, password, role } = sellerData;

        // Check existing user
        const existingUserByEmail = await this.userRepo.findUserByEmail(email);

        // Check for existing contact number
        const existingSellerByContact = await this.sellerRepo.findSellerByContact(contact);
        if (existingSellerByContact && existingUserByEmail?.isVerified === true) {
            throw new HttpError(400, "Contact already exists!");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser;
        let sellerProfile;

        // Check for existing email
        if (existingUserByEmail) {
            if (existingUserByEmail?.isVerified) {
                throw new HttpError(400, "Email already registered!");
            }

            // Update existing unverified user
            newUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
                isVerified: true,
                role,
            });

            if (!newUser) {
                throw new HttpError(404, "User with this id not found!");
            }

            // If sellerProfile does not exist for this user, create one
            sellerProfile = await this.sellerRepo.findSellerById(newUser._id.toString());

            if (!sellerProfile) {
                sellerProfile = await this.sellerRepo.createSeller({
                    baseUserId: newUser._id.toString(),
                    fullName,
                    contact,
                    password: hashedPassword,
                    profilePictureUrl
                });
            }
            else {
                // Update if exists
                sellerProfile = await this.sellerRepo.updateSeller(sellerProfile._id.toString(), {
                    fullName,
                    contact,
                    password: hashedPassword,
                });
            }
        }
        else {
            // Create new user
            newUser = await this.userRepo.createUser({
                email,
                role,
                isVerified: true,
                isPermanentlyBanned: false
            });

            if (!newUser) {
                throw new HttpError(404, "User with this id not found!");
            }

            sellerProfile = await this.sellerRepo.createSeller({
                baseUserId: newUser._id.toString(),
                fullName,
                contact,
                password: hashedPassword,
                profilePictureUrl
            });
        }

        if (!sellerProfile) {
            if (profilePicture) {
                await processDeleteUpload(profilePictureUrl!);
            }
            await this.userRepo.deleteUser(newUser._id.toString());
            throw new HttpError(404, "Seller with this id not found!");
        }

        // JWT Expiry Calculation in seconds for Signup Token
        const secondsInAYear = 365 * 24 * 60 * 60;
        const expiresInSeconds = Number(process.env.JWT_SIGNUP_EXPIRES_IN) * secondsInAYear;

        // Generate Token
        const token = jwt.sign(
            { _id: newUser._id.toString(), baseUserId: newUser._id.toString() || sellerProfile.baseUserId.toString(), email: newUser.email, contact: sellerProfile.contact, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: expiresInSeconds }
        );

        const respose: SellerResponseDtoType = {
            success: true,
            message: "Seller registered successfully.",
            status: 201,
            token,
            user: {
                _id: sellerProfile._id.toString(),
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified,
                baseUserId: sellerProfile.baseUserId.toString(),
                fullName: sellerProfile.fullName,
                contact: sellerProfile.contact,
                profilePictureUrl: sellerProfile.profilePictureUrl,
                isPermanentlyBanned: newUser.isPermanentlyBanned,
            }
        };
        return respose;
    };

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

    getSellerById = async (sellerId: string): Promise<SellerResponseDtoType> => {
        if (!sellerId || sellerId.trim() === "") {
            throw new HttpError(400, "Seller id is required!");
        }

        const decodedSellerId = decodeURIComponent(sellerId);
        const existingSeller = await this.sellerRepo.findSellerById(decodedSellerId);

        if (!existingSeller) {
            throw new HttpError(404, "Seller with this id not found!");
        }

        const existingBaseUser = await this.userRepo.findUserById(existingSeller.baseUserId.toString());
        if (!existingBaseUser) {
            throw new HttpError(404, "Base user with this user id not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller data fetched successfully.",
            status: 200,
            user: {
                _id: existingSeller._id.toString(),
                email: existingBaseUser.email,
                role: existingBaseUser.role,
                isVerified: existingBaseUser.isVerified,
                baseUserId: existingSeller.baseUserId.toString() || existingBaseUser._id.toString(),
                fullName: existingSeller.fullName,
                contact: existingSeller.contact,
                profilePictureUrl: existingSeller.profilePictureUrl,
                isPermanentlyBanned: existingBaseUser.isPermanentlyBanned,
                bio: existingSeller.bio,
            }
        };
        return response;
    };

    updateSellerProfileDetails = async (sellerId: string, updateSellerData: UpdateSellerByAdminDtoType): Promise<SellerResponseDtoType> => {
        const { fullName, contact, email } = updateSellerData;

        const existingSeller = await this.sellerRepo.findSellerById(sellerId);
        if (!existingSeller) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const existingBaseUser = await this.userRepo.findUserById(existingSeller.baseUserId.toString());
        if (!existingBaseUser) {
            throw new HttpError(404, "Base user with base user id not found!");
        }

        // Changing email
        if (existingBaseUser.email !== email) {
            const existingUserByEmail = await this.userRepo.findUserByEmail(email);
            if (existingUserByEmail && (existingUserByEmail._id.toString() !== existingBaseUser._id.toString()) && existingBaseUser.isVerified) {
                throw new HttpError(400, "Email already registered!");
            }
        }

        // Changing contact
        if (existingSeller.contact !== contact) {
            const existingSellerByContact = await this.sellerRepo.findSellerByContact(contact);
            if (existingSellerByContact && (existingSellerByContact._id.toString() !== sellerId) && existingBaseUser.isVerified) {
                throw new HttpError(400, "Contact already exists!");
            }
        }

        const updatedSeller = await this.sellerRepo.updateSeller(existingSeller._id.toString(), {
            fullName,
            contact
        });

        if (!updatedSeller) {
            throw new HttpError(404, "Seller is not updated and not found!");
        }

        const updatedBaseUser = await this.userRepo.updateUser(existingSeller.baseUserId.toString(), { email });
        if (!updatedBaseUser) {
            throw new HttpError(404, "Base user is not updated and not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller profile details updated successfully.",
            status: 200,
            user: {
                _id: updatedSeller._id.toString(),
                baseUserId: updatedSeller.baseUserId.toString() ?? updatedBaseUser._id.toString(),
                email: updatedBaseUser.email,
                fullName: updatedSeller.fullName,
                contact: updatedSeller.contact,
                role: updatedBaseUser.role,
                isVerified: updatedBaseUser.isVerified,
                profilePictureUrl: updatedSeller.profilePictureUrl,
                isPermanentlyBanned: updatedBaseUser.isPermanentlyBanned,
                bio: updatedSeller.bio,
            }
        };
        return response;
    };

    uploadSellerProfilePicture = async (sellerId: string, profilePicture: Express.Multer.File, imageSubFolder?: string): Promise<UploadImageAdminResponseDtoType> => {
        if (!profilePicture) {
            throw new HttpError(400, "No file provided! Upload a file.");
        }

        if (!profilePicture.mimetype.startsWith("image/")) {
            throw new HttpError(400, "Only image files are allowed!");
        }

        const existingSellerBySellerId = await this.sellerRepo.findSellerById(sellerId);
        if (!existingSellerBySellerId) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const imageUrl = await processSingleUpload(profilePicture, imageSubFolder || "profile-pictures/sellers");

        const updatedSeller = await this.sellerRepo.updateSeller(existingSellerBySellerId._id.toString(), {
            profilePictureUrl: imageUrl
        });

        if (!updatedSeller || !updatedSeller.profilePictureUrl) {
            await processDeleteUpload(imageUrl);
            throw new HttpError(404, "Seller is not found along with profile picture!");
        }

        if (existingSellerBySellerId.profilePictureUrl) {
            await processDeleteUpload(existingSellerBySellerId.profilePictureUrl);
        }

        const response: UploadImageAdminResponseDtoType = {
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
            throw new HttpError(400, "Admin id is required!");
        }

        const decodedSellerId = decodeURIComponent(sellerId);

        const existingSellerBySellerId = await this.sellerRepo.findSellerById(sellerId);
        if (!existingSellerBySellerId) {
            throw new HttpError(404, "Seller with the seller id not found!");
        }

        const deletedSeller = await this.sellerRepo.deleteSeller(decodedSellerId);
        if (!deletedSeller) {
            throw new HttpError(400, "Seller account could not deleted!");
        }

        if (existingSellerBySellerId.profilePictureUrl) {
            await processDeleteUpload(existingSellerBySellerId.profilePictureUrl);
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: `Seller account with id '${sellerId}' deleted successfully.`,
            status: 200
        };
        return response;
    };
}