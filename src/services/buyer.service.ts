// src/services/buyer.service.ts
import type { BuyerResponseDtoType, GetBuyerByEmailDtoType, GetBuyerByIdType } from "./../dtos/buyer.dto.ts";
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


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
        const existingBuyerById = await this.buyerRepo.findBuyerById(buyerId);
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

    getBuyerByEmail = async (getBuyerByEmailDto: GetBuyerByEmailDtoType): Promise<BuyerResponseDtoType | null> => {
        const { email } = getBuyerByEmailDto;

        if (!email || email.trim() === '') {
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

    getBuyerById = async (getBuyerByIdDto: GetBuyerByIdType): Promise<BuyerResponseDtoType | null> => {
        const { id } = getBuyerByIdDto;

        if (!id || id.trim() === '') {
            throw new HttpError(400, "Buyer id is required!");
        }

        const decodedBuyerId = decodeURIComponent(id);
        const exisitingBuyerById = await this.buyerRepo.findBuyerById(decodedBuyerId);

        if (!exisitingBuyerById) {
            throw new HttpError(404, "Buyer with this id not found!");
        }

        // Check existing user
        const exisitingBaseUserByBaseUserId = await this.userRepo.findUserById(exisitingBuyerById.baseUserId.toString());
        if (!exisitingBaseUserByBaseUserId) {
            throw new HttpError(404, "User with this id not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer with this id successfully fetched.",
            status: 200,
            user: {
                _id: exisitingBuyerById._id.toString(),
                email: exisitingBaseUserByBaseUserId.email,
                role: exisitingBaseUserByBaseUserId.role,
                isVerified: exisitingBaseUserByBaseUserId.isVerified,
                baseUserId: exisitingBuyerById.baseUserId.toString() || exisitingBaseUserByBaseUserId._id.toString(),
                fullName: exisitingBuyerById.fullName,
                username: exisitingBuyerById.username,
                contact: exisitingBuyerById.contact,
                profilePictureUrl: exisitingBaseUserByBaseUserId.profilePictureUrl,
                bio: exisitingBuyerById.bio,
                isPermanentlyBanned: exisitingBaseUserByBaseUserId.isPermanentlyBanned,
            }
        };
        return response;
    };
}