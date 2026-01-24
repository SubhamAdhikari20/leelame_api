// src/services/seller-auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CreatedSellerDtoType, VerifyOtpForRegistrationDtoType, ForgotPasswordDtoType, ResetPasswordDtoType, SendEmailForRegistrationDtoType, SellerResponseDtoType, LoginSellerDtoType } from "./../../dtos/seller.dto.ts";
import type { UserRepositoryInterface } from "./../../interfaces/user.repository.interface.ts";
import type { SellerRepositoryInterface } from "./../../interfaces/seller.repository.interface.ts";
import { sendVerificationEmail } from "../../helpers/send-registration-verification-email.ts";
import { sendResetPasswordVerificationEmail } from "../../helpers/send-reset-password-verification-email.ts";
import { HttpError } from "./../../errors/http-error.ts";


export class SellerAuthService {
    private userRepo: UserRepositoryInterface;
    private sellerRepo: SellerRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        sellerRepo: SellerRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.sellerRepo = sellerRepo;
    }

    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    private contactRegex = /^[0-9]{10}$/;

    private normalizeForResponse = (baseUser: any, profile: any) => {
        return {
            _id: (profile && (baseUser.role === "seller")) ? profile._id.toString() : profile._id,
            fullName: profile.fullName ?? null,
            username: profile.username ?? null,
            contact: profile.contact ?? null,
            profilePictureUrl: baseUser.profilePictureUrl ?? null,
            bio: profile.bio ?? null,
            terms: profile.terms,
            userId: (profile.userId || baseUser._id) ? profile.userId.toString() : baseUser._id.toString(),
            baseUser: {
                _id: (profile.userId || baseUser._id) ? profile.userId.toString() : baseUser._id.toString(),
                email: baseUser.email,
                role: baseUser.role,
                isVerified: baseUser.isVerified,
                isPermanentlyBanned: baseUser.isPermanentlyBanned,
            }
        };
    };

    createSeller = async (sellerData: CreatedSellerDtoType): Promise<SellerResponseDtoType | null> => {
        const { fullName, contact, email, password, role } = sellerData;

        // Check existing user
        const existingUserByEmail = await this.userRepo.findUserByEmail(email);

        // Check for existing contact number
        const existingSellerByContact = await this.sellerRepo.findSellerByContact(contact);
        if (existingSellerByContact && existingUserByEmail?.isVerified === true) {
            throw new HttpError(400, "Contact already exists!");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Add 10 mins from 'now'

        let newUser;
        let sellerProfile;
        let isNewUserCreated = false;
        let isNewProfileCreated = false;

        // Check for existing email
        if (existingUserByEmail) {
            if (existingUserByEmail?.isVerified) {
                throw new HttpError(400, "Email already registered!");
            }

            // Update existing unverified user
            newUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
                verifyCode: otp,
                verifyCodeExpiryDate: expiryDate,
                role,
            });

            if (!newUser) {
                throw new HttpError(404, "User with this id not found!");
            }

            // If sellerProfile does not exist for this user, create one
            sellerProfile = await this.sellerRepo.findSellerById(newUser._id.toString());

            if (!sellerProfile) {
                sellerProfile = await this.sellerRepo.createSeller({
                    userId: newUser._id.toString(),
                    fullName,
                    contact,
                });

                isNewProfileCreated = true;
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
                isVerified: false,
                verifyCode: otp,
                verifyCodeExpiryDate: expiryDate,
                isPermanentlyBanned: false
            });

            if (!newUser) {
                throw new HttpError(404, "User with this id not found!");
            }

            sellerProfile = await this.sellerRepo.createSeller({
                userId: newUser._id.toString(),
                fullName,
                contact,
                password: hashedPassword,
            });

            isNewUserCreated = true;
        }

        if (!sellerProfile) {
            throw new HttpError(404, "Seller with this id not found!");
        }

        // JWT Expiry Calculation in seconds for Signup Token
        const secondsInAYear = 365 * 24 * 60 * 60;
        const expiresInSeconds = Number(process.env.JWT_SIGNUP_EXPIRES_IN) * secondsInAYear;

        // Generate Token
        const token = jwt.sign(
            { _id: newUser._id, email: newUser.email, contact: sellerProfile.contact, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: expiresInSeconds }
        );

        // Send verification email
        const emailResponse = await sendVerificationEmail(fullName, email, otp);
        if (!emailResponse.success) {
            // Rollback user creation if email sending fails
            if (isNewUserCreated) {
                await this.userRepo.deleteUser(newUser._id.toString());
                await this.sellerRepo.deleteSeller(sellerProfile._id.toString());
            }
            else {
                // If it was an existing unverified user, clear verification fields
                newUser = await this.userRepo.updateUser(newUser._id.toString(), {
                    verifyCode: null,
                    verifyCodeExpiryDate: null,
                    role,
                });

                // If profile was updated (not new), we don't revert changes for simplicity
                if (isNewProfileCreated) {
                    await this.sellerRepo.deleteSeller(sellerProfile._id.toString());
                }
            }
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email!");
        }

        newUser = await this.userRepo.updateUser(newUser._id.toString(), {
            sellerProfile: sellerProfile._id.toString()
        });

        if (!newUser) {
            throw new HttpError(404, "User with this id not found!");
        }

        const respose: SellerResponseDtoType = {
            success: true,
            message: "Seller registered successfully. Please verify your email.",
            status: 201,
            token,
            user: {
                _id: sellerProfile._id.toString(),
                userId: sellerProfile.userId.toString(),
                fullName: sellerProfile.fullName,
                contact: sellerProfile.contact,
                createdAt: sellerProfile.createdAt,
                updatedAt: sellerProfile.updatedAt,
                baseUser: {
                    _id: newUser._id.toString(),
                    email: newUser.email,
                    role: newUser.role,
                    isVerified: newUser.isVerified,
                    isPermanentlyBanned: newUser.isPermanentlyBanned,
                }
            }
        };
        return respose;
    };

    verifyOtpForRegistration = async (verifyOtpForRegistrationDto: VerifyOtpForRegistrationDtoType): Promise<SellerResponseDtoType> => {
        const { email, otp } = verifyOtpForRegistrationDto;
        console.log(email);

        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        if (!otp || otp.trim() === "") {
            throw new HttpError(400, "OTP is required!");
        }

        const existingUserByEmail = await this.userRepo.findUserByEmail(email);
        if (!existingUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        if (existingUserByEmail.isVerified) {
            throw new HttpError(400, "This account is already verified! Please login.");
        }

        if (!existingUserByEmail.verifyCode || !existingUserByEmail.verifyCodeExpiryDate) {
            throw new HttpError(400, "No OTP request found! Please request for a new OTP.");
        }

        if (new Date() > existingUserByEmail.verifyCodeExpiryDate) {
            throw new HttpError(400, "OTP has expired! Please request for a new OTP.");
        }

        if (existingUserByEmail.verifyCode !== otp) {
            throw new HttpError(400, "Invalid OTP! Please try again.");
        }

        const existingSellerByBaseUserId = await this.sellerRepo.findSellerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingSellerByBaseUserId) {
            throw new HttpError(404, "Seller with this id not found!");
        }

        const updatedUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
            isVerified: true,
            verifyCode: null,
            verifyCodeExpiryDate: null,
        });

        if (!updatedUser) {
            throw new HttpError(404, "User is not updated and not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Account verified successfully. You can now login.",
            status: 200,
        };
        return response;
    };

    loginSeller = async (loginSellerDto: LoginSellerDtoType): Promise<SellerResponseDtoType | null> => {
        const { identifier, password, role } = loginSellerDto;
        if (!role) {
            throw new HttpError(400, "User role is required!");
        }

        if (!identifier || !password) {
            throw new HttpError(400, "Missing credentails! Credentails are required!");
        }

        // Email OR Username
        if (role === "seller") {
            const isEmailFormat = this.emailRegex.test(identifier);
            const isContactFormat = this.contactRegex.test(identifier);

            if (!isEmailFormat && !isContactFormat) {
                throw new HttpError(400, "Invalid identifier! Identifier must be a valid email or phone number.");
            }

            let user;
            let sellerProfile;
            let expiresInSeconds;
            let token;

            if (isEmailFormat) {
                user = await this.userRepo.findUserByEmail(identifier);
                if (!user || user.role !== role) {
                    throw new HttpError(404, "Invalid email! No seller account found with this email.");
                }

                sellerProfile = await this.sellerRepo.findSellerByBaseUserId(user._id.toString());
                if (!sellerProfile) {
                    throw new HttpError(404, "Seller user not found for this email.");
                }

                const hashedPassword = sellerProfile.password;
                if (!hashedPassword) {
                    throw new HttpError(400, "Password not found for seller!");
                }

                const isMatched = await bcrypt.compare(password, hashedPassword);
                if (!isMatched) {
                    throw new HttpError(400, "Invalid password! Please enter correct password.");
                }

                // JWT Expiry Calculation in seconds for Login Token (1 Day)
                expiresInSeconds = Number(process.env.JWT_LOGIN_EXPIRES_IN) * 60 * 60;

                // Generate Token
                token = jwt.sign(
                    { _id: sellerProfile._id.toString(), userId: user._id.toString() ?? sellerProfile.userId.toString(), email: user.email, phoneNumber: sellerProfile.contact, role: user.role },
                    process.env.JWT_SECRET!,
                    { expiresIn: expiresInSeconds }
                );

                const response: SellerResponseDtoType = {
                    success: true,
                    message: "Logged in as seller successfully.",
                    status: 200,
                    token,
                    user: this.normalizeForResponse(user, sellerProfile)
                };
                return response;
            }

            // If identifer is a phone number;
            sellerProfile = await this.sellerRepo.findSellerByContact(identifier);
            if (!sellerProfile) {
                throw new HttpError(404, "Invalid phone number! No seller account found with this phone number.");
            }

            if (!sellerProfile.password) {
                throw new HttpError(400, "Password not found for seller!");
            }

            const isMatched = await bcrypt.compare(password, sellerProfile.password);
            if (!isMatched) {
                throw new HttpError(400, "Invalid password! Please enter correct password.");
            }

            user = await this.userRepo.findUserById(sellerProfile.userId.toString());
            if (!user) {
                throw new HttpError(404, "User not found!");
            }

            // JWT Expiry Calculation in seconds for Login Token (1 Day)
            expiresInSeconds = Number(process.env.JWT_LOGIN_EXPIRES_IN) * 60 * 60;

            // Generate Token
            token = jwt.sign(
                { _id: sellerProfile._id.toString(), userId: user._id.toString() ?? sellerProfile.userId.toString(), email: user.email, phoneNumber: sellerProfile.contact, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: expiresInSeconds }
            );

            const response: SellerResponseDtoType = {
                success: true,
                message: "Logged in as seller successfully.",
                status: 200,
                token,
                user: this.normalizeForResponse(user, sellerProfile)
            };
            return response;
        }

        throw new HttpError(400, "Invalid role! Role is unknown.");
    };

    forgotPassword = async (forgotPasswordDto: ForgotPasswordDtoType): Promise<SellerResponseDtoType | null> => {
        const { email } = forgotPasswordDto;

        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        const existingUserByEmail = await this.userRepo.findUserByEmail(email);
        if (!existingUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        if (!existingUserByEmail.isVerified) {
            throw new HttpError(400, "This account is not verified! Please verify your email first.");
        }

        const existingSellerByBaseUserId = await this.sellerRepo.findSellerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingSellerByBaseUserId) {
            throw new HttpError(404, "Seller with this base user id not found!");
        }

        // send verfication email for reseting password
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);    // Add 10 mins from 'now'

        const updatedUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
            verifyEmailResetPassword: otp,
            verifyEmailResetPasswordExpiryDate: expiryDate
        });

        if (!updatedUser) {
            throw new HttpError(404, "User is not updated and not found!");
        }

        const emailResponse = await sendResetPasswordVerificationEmail(
            existingSellerByBaseUserId.fullName,
            email,
            otp
        );

        if (!emailResponse.success) {
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Reset password instructions have been sent to your email",
            status: 200,
        };
        return response;
    };

    resetPassword = async (resetPasswordDto: ResetPasswordDtoType): Promise<SellerResponseDtoType> => {
        const { email, otp, newPassword } = resetPasswordDto;

        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        if (!otp || otp.trim() === '') {
            throw new HttpError(400, "OTP is required!");
        }

        if (!newPassword || newPassword.trim() === "") {
            throw new HttpError(400, "New password is required!");
        }

        const existingUserByEmail = await this.userRepo.findUserByEmail(email);
        if (!existingUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        if (!existingUserByEmail.verifyEmailResetPassword || !existingUserByEmail.verifyEmailResetPasswordExpiryDate) {
            throw new HttpError(400, "No OTP request found! Please request for a new OTP.");
        }

        if (new Date() > existingUserByEmail.verifyEmailResetPasswordExpiryDate) {
            throw new HttpError(400, "OTP has expired! Please request for a new OTP.");
        }

        if (existingUserByEmail.verifyEmailResetPassword !== otp) {
            throw new HttpError(400, "Invalid OTP! Please try again.");
        }

        const existingSellerByBaseUserId = await this.sellerRepo.findSellerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingSellerByBaseUserId) {
            throw new HttpError(404, "Seller with this base user id not found!");
        }

        const updatedUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
            verifyEmailResetPassword: null,
            verifyEmailResetPasswordExpiryDate: null,
        });

        if (!updatedUser) {
            throw new HttpError(404, "User is not updated and not found!");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedSeller = await this.sellerRepo.updateSeller(existingSellerByBaseUserId._id.toString(), {
            password: hashedPassword
        });

        if (!updatedSeller) {
            throw new HttpError(404, "Seller is not updated and not found!");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: "Password reset successfully. You can now login with your new password.",
            status: 200,
        };
        return response;
    };

    handleSendEmailForRegistration = async (sendEmailForRegistrationDto: SendEmailForRegistrationDtoType): Promise<SellerResponseDtoType> => {
        const { email } = sendEmailForRegistrationDto;
        if (!email) {
            throw new HttpError(400, "Email is required!");
        }

        const existingUserByEmail = await this.userRepo.findUserByEmail(email);
        if (!existingUserByEmail) {
            throw new HttpError(404, "User with email not found!");
        }

        if (existingUserByEmail.isVerified) {
            throw new HttpError(400, "This account is already verified! Please login.");
        }

        const existingSellerByBaseUserId = await this.sellerRepo.findSellerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingSellerByBaseUserId) {
            throw new HttpError(404, "Seller with this base user id not found!");
        }

        // generate 6‑digit OTP and expiry date
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);    // Add 10 mins from 'now'

        const updatedUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
            verifyCode: otp,
            verifyCodeExpiryDate: expiryDate
        });

        if (!updatedUser) {
            throw new HttpError(404, "User is not updated and not found!");
        }

        const emailResponse = await sendVerificationEmail(existingSellerByBaseUserId.fullName, email, otp);
        if (!emailResponse.success) {
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email! Try again later.");
        }

        const response: SellerResponseDtoType = {
            success: true,
            message: emailResponse.message ?? "Verification email sent successfully. Please check your inbox.",
            status: 200
        };
        return response;
    };

    logoutSeller = async (): Promise<SellerResponseDtoType> => {
        const response: SellerResponseDtoType = {
            success: true,
            message: "Logged out successfully.",
            status: 200,
        };
        return response;
    };
}