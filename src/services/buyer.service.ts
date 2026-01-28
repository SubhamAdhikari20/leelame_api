// src/services/buyer.service.ts
import type { BuyerResponseDtoType, UpdateBuyerProfileDetailsDtoType, UploadBuyerProfilePictureDtoType, UploadImageBuyerResponseDtoType } from "./../dtos/buyer.dto.ts";
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";
import { uploadImage } from "./../middleware/upload-image.middleware.ts";


export class BuyerService {
    private userRepo: UserRepositoryInterface;
    private buyerRepo: BuyerRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        buyerRepo: BuyerRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.buyerRepo = buyerRepo;
    }

    getCurrentBuyerUser = async (buyerId: string): Promise<BuyerResponseDtoType> => {
        if (!buyerId || buyerId.trim() === "") {
            throw new HttpError(400, "Buyer id is required!");
        }

        const decodedBuyerId = decodeURIComponent(buyerId);
        const existingBuyerById = await this.buyerRepo.findBuyerById(decodedBuyerId);
        if (!existingBuyerById) {
            throw new HttpError(404, "Buyer with this id not found!");
        }

        const exisitingBaseUserByBaseUserId = await this.userRepo.findUserById(existingBuyerById.baseUserId.toString());
        if (!exisitingBaseUserByBaseUserId) {
            throw new HttpError(404, "Base user with this user id not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer profile details updated successfully.",
            status: 200,
            user: {
                _id: existingBuyerById._id.toString(),
                email: exisitingBaseUserByBaseUserId.email,
                role: exisitingBaseUserByBaseUserId.role,
                isVerified: exisitingBaseUserByBaseUserId.isVerified,
                baseUserId: existingBuyerById.baseUserId.toString() || exisitingBaseUserByBaseUserId._id.toString(),
                fullName: existingBuyerById.fullName,
                username: existingBuyerById.username,
                contact: existingBuyerById.contact,
                profilePictureUrl: existingBuyerById.profilePictureUrl,
                bio: existingBuyerById.bio,
                isPermanentlyBanned: exisitingBaseUserByBaseUserId.isPermanentlyBanned,
            }
        };
        return response;
    };

    updateBuyerProfileDetails = async (buyerId: string, updateBuyerProfileDetailsDto: UpdateBuyerProfileDetailsDtoType): Promise<BuyerResponseDtoType> => {
        const { fullName, username, contact, email, bio } = updateBuyerProfileDetailsDto;

        const existingBuyerById = await this.buyerRepo.findBuyerById(buyerId);
        if (!existingBuyerById) {
            throw new HttpError(404, "Buyer with the buyer id not found!");
        }

        const existingBaseUserByBaseUserId = await this.userRepo.findUserById(existingBuyerById.baseUserId.toString());
        if (!existingBaseUserByBaseUserId) {
            throw new HttpError(404, "Base with base user id not found!");
        }

        // Changing email
        let existingBuyerByEmail;
        if (existingBaseUserByBaseUserId.email !== email) {
            existingBuyerByEmail = await this.buyerRepo.findBuyerByEmail(email);
            if (existingBuyerByEmail && (existingBuyerByEmail._id.toString() !== buyerId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Email already registered!");
            }
        }

        // Changing contact or phone number
        let existingBuyerByContact;
        if (existingBuyerById.contact !== contact) {
            existingBuyerByContact = await this.buyerRepo.findBuyerByContact(contact);
            if (existingBuyerByContact && (existingBuyerByContact._id.toString() !== buyerId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Contact already exists!");
            }
        }

        // let otp: string;
        // let updateBaseUser;
        // let updatedBuyer;

        // Changing username
        let existingBuyerByUsername;
        if (existingBuyerById.username !== username) {
            existingBuyerByUsername = await this.buyerRepo.findBuyerByUsername(username);
            if (existingBuyerByUsername && (existingBuyerByUsername._id.toString() !== buyerId) && (existingBaseUserByBaseUserId.isVerified === true)) {
                throw new HttpError(400, "Username already exists!");
            }

            // If the username is not taken
            // otp = Math.floor(100000 + Math.random() * 900000).toString();
            // const expiryDate = new Date();
            // expiryDate.setMinutes(expiryDate.getMinutes() + 10);

            // updateBaseUser = await this.userRepo.updateUser(existingBuyerById.baseUserId.toString(), {
            //     verifyCode: otp,
            //     verifyCodeExpiryDate: expiryDate,
            //     isVerified: false
            // });

            // if (!updateBaseUser) {
            //     throw new HttpError(404, "Base user is not updated and not found!");
            // }
        }

        const updatedBuyer = await this.buyerRepo.updateBuyer(existingBuyerById._id.toString(), {
            fullName,
            username,
            contact,
            bio
        });

        if (!updatedBuyer) {
            throw new HttpError(404, "Buyer is not updated and not found!");
        }

        const updateBaseUser = await this.userRepo.updateUser(existingBuyerById.baseUserId.toString(), { email });
        if (!updateBaseUser) {
            throw new HttpError(404, "Base user is not updated and not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer profile details updated successfully.",
            status: 200,
            user: {
                _id: updatedBuyer._id.toString(),
                baseUserId: updatedBuyer.baseUserId.toString() ?? updateBaseUser._id.toString(),
                email: updateBaseUser.email,
                fullName: updatedBuyer.fullName,
                username: updatedBuyer.username,
                contact: updatedBuyer.contact,
                role: updateBaseUser.role,
                isVerified: updateBaseUser.isVerified,
                profilePictureUrl: updatedBuyer.profilePictureUrl,
                isPermanentlyBanned: updateBaseUser.isPermanentlyBanned,
            }
        };
        return response;
    };

    uploadProfilePicture = async (userId: string, uploadProfilePictureDto: UploadBuyerProfilePictureDtoType): Promise<UploadImageBuyerResponseDtoType> => {
        const { profilePicture } = uploadProfilePictureDto;

        const existingBuyerById = await this.buyerRepo.findBuyerById(userId);
        if (!existingBuyerById) {
            throw new HttpError(404, "Buyer with the buyer id not found!");
        }

        const arrayBuffer = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageUrl = await uploadImage(buffer, profilePicture.name, "leelame/profile-pictures/buyers");

        const updatedBuyer = await this.buyerRepo.updateBuyer(existingBuyerById._id.toString(), {
            profilePictureUrl: imageUrl
        });

        if (!updatedBuyer || !updatedBuyer.profilePictureUrl) {
            throw new HttpError(404, "Buyer is not found along with profile picture!");
        }

        const response: UploadImageBuyerResponseDtoType = {
            success: true,
            message: "Buyer profile picture uploaded successfully.",
            status: 200,
            data: {
                imageUrl: updatedBuyer.profilePictureUrl
            }
        };
        return response;
    };

    deleteBuyerAccount = async (buyerId: string): Promise<BuyerResponseDtoType | null> => {
        if (!buyerId || buyerId.trim() === "") {
            throw new HttpError(400, "Buyer id is required!");
        }

        const decodedBuyerId = decodeURIComponent(buyerId);
        const deletedBuyer = await this.buyerRepo.deleteBuyer(decodedBuyerId);
        if (!deletedBuyer) {
            throw new HttpError(400, "Buyer account not deleted!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer account deleted profile successfully.",
            status: 200
        };
        return response;
    }

    getBuyerByEmail = async (email: string): Promise<BuyerResponseDtoType | null> => {
        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        // Check existing user
        const decodedEmail = decodeURIComponent(email);
        const exisitingBaseUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!exisitingBaseUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        // const buyer = await this.buyerRepo.findBuyerByEmail(decodedEmail);
        const existingBuyerByBaseUserId = await this.buyerRepo.findBuyerByBaseUserId(exisitingBaseUserByEmail._id.toString());
        if (!existingBuyerByBaseUserId) {
            throw new HttpError(404, "Buyer with this base user id not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer with this email successfully fetched.",
            status: 200,
            user: {
                _id: existingBuyerByBaseUserId._id.toString(),
                email: exisitingBaseUserByEmail.email,
                role: exisitingBaseUserByEmail.role,
                isVerified: exisitingBaseUserByEmail.isVerified,
                baseUserId: existingBuyerByBaseUserId.baseUserId.toString() || exisitingBaseUserByEmail._id.toString(),
                fullName: existingBuyerByBaseUserId.fullName,
                username: existingBuyerByBaseUserId.username,
                contact: existingBuyerByBaseUserId.contact,
                profilePictureUrl: exisitingBaseUserByEmail.profilePictureUrl,
                bio: existingBuyerByBaseUserId.bio,
                isPermanentlyBanned: exisitingBaseUserByEmail.isPermanentlyBanned,
            }
        };
        return response;
    };
}