// src/services/existingSellerByBaseUserId.service.ts
import type { SellerResponseDtoType, GetSellerByEmailDtoType, GetSellerByIdType, GetCurrentSellerDtoType } from "./../dtos/seller.dto.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


export class SellerService {
    private userRepo: UserRepositoryInterface;
    private existingSellerByBaseUserIdRepo: SellerRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        existingSellerByBaseUserIdRepo: SellerRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.existingSellerByBaseUserIdRepo = existingSellerByBaseUserIdRepo;
    }

    getCurrentSellerUser = async (getCurrentSellerDto: GetCurrentSellerDtoType): Promise<SellerResponseDtoType> => {
        const { id } = getCurrentSellerDto;

        const existingSellerById = await this.existingSellerByBaseUserIdRepo.findSellerById(id);
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

    getSellerByEmail = async (getSellerByEmailDto: GetSellerByEmailDtoType): Promise<SellerResponseDtoType | null> => {
        const { email } = getSellerByEmailDto;

        if (!email || email.trim() === '') {
            throw new HttpError(400, "Email is required!");
        }

        // Check existing user
        const decodedEmail = decodeURIComponent(email);
        const exisitingBaseUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!exisitingBaseUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        // const existingSellerByBaseUserId = await this.existingSellerByBaseUserIdRepo.findSellerByEmail(decodedEmail);
        const existingSellerByBaseUserId = await this.existingSellerByBaseUserIdRepo.findSellerByBaseUserId(exisitingBaseUserByEmail._id.toString());
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

    getSellerById = async (getSellerByIdDto: GetSellerByIdType): Promise<SellerResponseDtoType | null> => {
        const { id } = getSellerByIdDto;

        if (!id || id.trim() === '') {
            throw new HttpError(400, "Seller id is required!");
        }

        const decodedSellerId = decodeURIComponent(id);
        const exisitingSellerById = await this.existingSellerByBaseUserIdRepo.findSellerById(decodedSellerId);

        if (!exisitingSellerById) {
            throw new HttpError(404, "Seller with this id not found!");
        }

        // Check existing user
        const exisitingBaseUserByBaseUserId = await this.userRepo.findUserById(exisitingSellerById.baseUserId.toString());
        if (!exisitingBaseUserByBaseUserId) {
            throw new HttpError(404, "User with this id not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller with this id successfully fetched.",
            status: 200,
            user: {
                _id: exisitingSellerById._id.toString(),
                email: exisitingBaseUserByBaseUserId.email,
                role: exisitingBaseUserByBaseUserId.role,
                isVerified: exisitingBaseUserByBaseUserId.isVerified,
                baseUserId: exisitingSellerById.baseUserId.toString() || exisitingBaseUserByBaseUserId._id.toString(),
                fullName: exisitingSellerById.fullName,
                contact: exisitingSellerById.contact,
                profilePictureUrl: exisitingBaseUserByBaseUserId.profilePictureUrl,
                bio: exisitingSellerById.bio,
                isPermanentlyBanned: exisitingBaseUserByBaseUserId.isPermanentlyBanned,
            }
        };
        return response;
    };
}