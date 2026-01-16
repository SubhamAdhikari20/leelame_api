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

    getBuyerByEmail = async (getBuyerByEmailDto: GetBuyerByEmailDtoType): Promise<BuyerResponseDtoType | null> => {
        const { email } = getBuyerByEmailDto;

        if (!email || email.trim() === '') {
            throw new HttpError(400, "Email is required!");
        }

        // Check existing user
        const decodedEmail = decodeURIComponent(email);
        const existingUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!existingUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        // const buyer = await this.buyerRepo.findBuyerByEmail(decodedEmail);
        const buyer = await this.buyerRepo.findBuyerByBaseUserId(existingUserByEmail._id.toString());
        if (!buyer) {
            throw new HttpError(404, "Buyer with this base user id not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer with this email successfully fetched.",
            status: 200,
            user: {
                _id: buyer._id.toString(),
                userId: buyer.userId.toString(),
                fullName: buyer.fullName,
                username: buyer.username,
                contact: buyer.contact,
                profilePictureUrl: existingUserByEmail.profilePictureUrl,
                bio: buyer.bio,
                terms: buyer.terms,
                baseUser: {
                    _id: existingUserByEmail._id.toString(),
                    email: existingUserByEmail.email,
                    role: existingUserByEmail.role,
                    isVerified: existingUserByEmail.isVerified,
                    isPermanentlyBanned: existingUserByEmail.isPermanentlyBanned,
                }
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
        const buyerById = await this.buyerRepo.findBuyerById(decodedBuyerId);

        if (!buyerById) {
            throw new HttpError(404, "Buyer with this id not found!");
        }

        // Check existing user
        const existingUserById = await this.userRepo.findUserById(buyerById.userId.toString());
        if (!existingUserById) {
            throw new HttpError(404, "User with this id not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Buyer with this id successfully fetched.",
            status: 200,
            user: {
                _id: buyerById._id.toString(),
                userId: buyerById.userId.toString(),
                fullName: buyerById.fullName,
                username: buyerById.username,
                contact: buyerById.contact,
                profilePictureUrl: existingUserById.profilePictureUrl,
                bio: buyerById.bio,
                terms: buyerById.terms,
                baseUser: {
                    _id: existingUserById._id.toString(),
                    email: existingUserById.email,
                    role: existingUserById.role,
                    isVerified: existingUserById.isVerified,
                    isPermanentlyBanned: existingUserById.isPermanentlyBanned,
                }
            }
        };
        return response;
    };
}