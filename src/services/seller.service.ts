// src/services/seller.service.ts
import type { SellerResponseDtoType, GetSellerByEmailDtoType, GetSellerByIdType } from "./../dtos/seller.dto.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


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

    getSellerByEmail = async (getSellerByEmailDto: GetSellerByEmailDtoType): Promise<SellerResponseDtoType | null> => {
        const { email } = getSellerByEmailDto;

        if (!email || email.trim() === '') {
            throw new HttpError(400, "Email is required!");
        }

        // Check existing user
        const decodedEmail = decodeURIComponent(email);
        const existingUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!existingUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        // const seller = await this.sellerRepo.findSellerByEmail(decodedEmail);
        const seller = await this.sellerRepo.findSellerByBaseUserId(existingUserByEmail._id.toString());
        if (!seller) {
            throw new HttpError(404, "Seller with this base user id not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller with this email successfully fetched.",
            status: 200,
            user: {
                _id: seller._id.toString(),
                userId: seller.userId.toString(),
                fullName: seller.fullName,
                contact: seller.contact,
                profilePictureUrl: existingUserByEmail.profilePictureUrl,
                bio: seller.bio,
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

    getSellerById = async (getSellerByIdDto: GetSellerByIdType): Promise<SellerResponseDtoType | null> => {
        const { id } = getSellerByIdDto;

        if (!id || id.trim() === '') {
            throw new HttpError(400, "Seller id is required!");
        }

        const decodedSellerId = decodeURIComponent(id);
        const sellerById = await this.sellerRepo.findSellerById(decodedSellerId);

        if (!sellerById) {
            throw new HttpError(404, "Seller with this id not found!");
        }

        // Check existing user
        const existingUserById = await this.userRepo.findUserById(sellerById.userId.toString());
        if (!existingUserById) {
            throw new HttpError(404, "User with this id not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Seller with this id successfully fetched.",
            status: 200,
            user: {
                _id: sellerById._id.toString(),
                userId: sellerById.userId.toString(),
                fullName: sellerById.fullName,
                contact: sellerById.contact,
                profilePictureUrl: existingUserById.profilePictureUrl,
                bio: sellerById.bio,
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