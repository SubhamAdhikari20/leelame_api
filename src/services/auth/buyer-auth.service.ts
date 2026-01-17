// src/services/buyer-auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CreatedBuyerDtoType, BuyerResponseDtoType, CheckUsernameUniqueDtoType, LoginBuyerDtoType, ForgotPasswordDtoType, VerifyOtpForRegistrationDtoType, VerifyOtpForResetPasswordDtoType, ResetPasswordDtoType, SendEmailForRegistrationDtoType } from "../../dtos/buyer.dto.ts";
import type { BuyerRepositoryInterface } from "../../interfaces/buyer.repository.interface.ts";
import type { UserRepositoryInterface } from "../../interfaces/user.repository.interface.ts";
import { sendVerificationEmail } from "../../helpers/send-registration-verification-email.ts";
import { sendResetPasswordVerificationEmail } from "../../helpers/send-reset-password-verification-email.ts";
import { HttpError } from "../../errors/http-error.ts";


export class BuyerAuthService {
    private userRepo: UserRepositoryInterface;
    private buyerRepo: BuyerRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        buyerRepo: BuyerRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.buyerRepo = buyerRepo;
    }

    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    private usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;

    private normalizeForResponse = (baseUser: any, profile: any) => {
        return {
            _id: (profile && (baseUser.role === "buyer")) ? profile._id.toString() : profile._id,
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

    createBuyer = async (buyerData: CreatedBuyerDtoType): Promise<BuyerResponseDtoType | null> => {
        const { fullName, email, username, contact, password, terms, role } = buyerData;

        // Check existing user
        const existingUserByEmail = await this.userRepo.findUserByEmail(email);

        // Check for existing username
        const existingBuyerByUsername = await this.buyerRepo.findBuyerByUsername(username);
        if (
            existingBuyerByUsername &&
            existingUserByEmail?.isVerified === true
        ) {
            throw new HttpError(400, "Username already exists!");
        }

        // Check for existing contact number
        const existingBuyerByContact = await this.buyerRepo.findBuyerByContact(contact);
        if (existingBuyerByContact && existingUserByEmail?.isVerified === true) {
            throw new HttpError(400, "Contact already exists!");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Add 10 mins from 'now'

        let newUser;
        let buyerProfile;
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

            // If buyerProfile does not exist for this user, create one
            buyerProfile = await this.buyerRepo.findBuyerById(newUser._id.toString());

            if (!buyerProfile) {
                buyerProfile = await this.buyerRepo.createBuyer({
                    userId: newUser._id.toString(),
                    fullName,
                    username,
                    contact,
                    password: hashedPassword,
                    terms,
                });

                isNewProfileCreated = true;
            }
            else {
                // Update if exists
                buyerProfile = await this.buyerRepo.updateBuyer(buyerProfile._id.toString(), {
                    fullName,
                    username,
                    contact,
                    password: hashedPassword,
                    terms,
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

            buyerProfile = await this.buyerRepo.createBuyer({
                userId: newUser._id.toString(),
                fullName,
                username,
                contact,
                password: hashedPassword,
                terms,
            });

            isNewUserCreated = true;
        }

        if (!buyerProfile) {
            throw new HttpError(404, "Buyer with this id not found!");
        }

        // JWT Expiry Calculation in seconds for Signup Token
        const secondsInAYear = 365 * 24 * 60 * 60;
        const expiresInSeconds = Number(process.env.JWT_SIGNUP_EXPIRES_IN) * secondsInAYear;

        // Generate Token
        const token = jwt.sign(
            { _id: buyerProfile._id.toString(), userId: newUser._id.toString() ?? buyerProfile.userId.toString(), email: newUser.email, username: buyerProfile.username, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: expiresInSeconds }
        );

        // Send verification email
        const emailResponse = await sendVerificationEmail(fullName, email, otp);
        if (!emailResponse.success) {
            // Rollback user creation if email sending fails
            if (isNewUserCreated) {
                await this.userRepo.deleteUser(newUser._id.toString());
                await this.buyerRepo.deleteBuyer(buyerProfile._id.toString());
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
                    await this.buyerRepo.deleteBuyer(buyerProfile._id.toString());
                }
            }
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email!");
        }

        newUser = await this.userRepo.updateUser(newUser._id.toString(), {
            buyerProfile: buyerProfile._id.toString()
        });

        if (!newUser) {
            throw new HttpError(404, "User with this id not found!");
        }

        const respose: BuyerResponseDtoType = {
            success: true,
            message: "User registered successfully. Please verify your email.",
            status: 201,
            token,
            user: {
                _id: buyerProfile._id.toString(),
                userId: buyerProfile.userId.toString(),
                fullName: buyerProfile.fullName,
                username: buyerProfile.username,
                contact: buyerProfile.contact,
                profilePictureUrl: newUser.profilePictureUrl,
                bio: buyerProfile.bio,
                terms: buyerProfile.terms,
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

    checkUsernameUnique = async (checkUsernameUniqueDto: CheckUsernameUniqueDtoType): Promise<BuyerResponseDtoType | null> => {
        const { username } = checkUsernameUniqueDto;

        const decodedUsername = decodeURIComponent(username);
        const existingBuyer = await this.buyerRepo.findBuyerByUsername(decodedUsername);

        if (!existingBuyer) {
            const response: BuyerResponseDtoType = {
                success: true,
                message: "Username is available",
                status: 200,
            };
            return response;
        }

        const linkedUser = await this.userRepo.findUserById(existingBuyer.userId.toString());
        if (linkedUser && linkedUser.isVerified === true) {
            throw new HttpError(400, "Username is already taken!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Username is available",
            status: 200
        };
        return response;
    };

    verifyOtpForRegistration = async (verifyOtpForRegistrationDto: VerifyOtpForRegistrationDtoType): Promise<BuyerResponseDtoType> => {
        const { username, otp } = verifyOtpForRegistrationDto;

        if (!username || username.trim() === "") {
            throw new HttpError(400, "Username is required!");
        }

        if (!otp || otp.trim() === "") {
            throw new HttpError(400, "OTP is required!");
        }

        const decodedUsername = decodeURIComponent(username);
        const existingBuyerByUsername = await this.buyerRepo.findBuyerByUsername(decodedUsername);

        if (!existingBuyerByUsername) {
            throw new HttpError(404, "Buyer with this username does not exist!");
        }

        const existingUserById = await this.userRepo.findUserById(existingBuyerByUsername.userId.toString());
        if (!existingUserById) {
            throw new HttpError(404, "User with this id does not exist!");
        }

        if (existingUserById.isVerified) {
            throw new HttpError(400, "This account is already verified! Please login.");
        }

        if (!existingUserById.verifyCode || !existingUserById.verifyCodeExpiryDate) {
            throw new HttpError(400, "No OTP request found! Please request for a new OTP.");
        }

        if (new Date() > existingUserById.verifyCodeExpiryDate) {
            throw new HttpError(400, "OTP has expired! Please request for a new OTP.");
        }

        if (existingUserById.verifyCode !== otp) {
            throw new HttpError(400, "Invalid OTP! Please try again.");
        }

        const updatedUser = await this.userRepo.updateUser(existingUserById._id.toString(), {
            isVerified: true,
            verifyCode: null,
            verifyCodeExpiryDate: null,
        });

        if (!updatedUser) {
            throw new HttpError(404, "User is not updated and not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Account verified successfully. You can now login.",
            status: 200,
        };
        return response;
    };

    loginBuyer = async (loginBuyerDto: LoginBuyerDtoType): Promise<BuyerResponseDtoType | null> => {
        const { identifier, password, role } = loginBuyerDto;
        if (!role) {
            throw new HttpError(400, "User role is required!");
        }

        if (!identifier || !password) {
            throw new HttpError(400, "Missing credentails! Credentails are required!");
        }

        // Email OR Username
        if (role === "buyer") {
            const isEmailFormat = this.emailRegex.test(identifier);
            const isUsernameFormat = this.usernameRegex.test(identifier);

            if (!isEmailFormat && !isUsernameFormat) {
                throw new HttpError(400, "Invalid identifier! Identifier must be a valid username or email.");
            }

            let user;
            let buyerProfile;
            let expiresInSeconds;
            let token;

            if (isEmailFormat) {
                user = await this.userRepo.findUserByEmail(identifier);
                if (!user || user.role !== role) {
                    throw new HttpError(404, "Invalid email! No buyer account found with this email.");
                }

                buyerProfile = await this.buyerRepo.findBuyerByBaseUserId(user._id.toString());
                if (!buyerProfile) {
                    throw new HttpError(404, "Buyer user not found for this email.");
                }

                const hashedPassword = buyerProfile.password;
                if (!hashedPassword) {
                    throw new HttpError(400, "Password not found for buyer!");
                }

                const isMatched = await bcrypt.compare(password, hashedPassword);
                if (!isMatched) {
                    throw new HttpError(400, "Invalid password! Please enter correct password.");
                }

                // JWT Expiry Calculation in seconds for Login Token (1 Day)
                expiresInSeconds = Number(process.env.JWT_LOGIN_EXPIRES_IN) * 60 * 60;

                // Generate Token
                token = jwt.sign(
                    { _id: buyerProfile._id.toString(), userId: user._id.toString() ?? buyerProfile.userId.toString(), email: user.email, username: user.buyerProfile, role: user.role },
                    process.env.JWT_SECRET!,
                    { expiresIn: expiresInSeconds }
                );

                const response: BuyerResponseDtoType = {
                    success: true,
                    message: "Logged in as buyer successfully.",
                    status: 200,
                    token,
                    user: this.normalizeForResponse(user, buyerProfile)
                };
                return response;
            }

            // If identifer is a username;
            buyerProfile = await this.buyerRepo.findBuyerByUsername(identifier);
            if (!buyerProfile) {
                throw new HttpError(404, "Invalid username! No buyer account found with this username.");
            }

            if (!buyerProfile.password) {
                throw new HttpError(400, "Password not found for buyer!");
            }

            const isMatched = await bcrypt.compare(password, buyerProfile.password);
            if (!isMatched) {
                throw new HttpError(400, "Invalid password! Please enter correct password.");
            }

            user = await this.userRepo.findUserById(buyerProfile.userId.toString());
            if (!user) {
                throw new HttpError(404, "User not found!");
            }

            // JWT Expiry Calculation in seconds for Login Token (1 Day)
            expiresInSeconds = Number(process.env.JWT_LOGIN_EXPIRES_IN) * 60 * 60;

            // Generate Token
            token = jwt.sign(
                { _id: buyerProfile._id.toString(), userId: user._id.toString() ?? buyerProfile.userId.toString(), email: user.email, username: buyerProfile.username, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: expiresInSeconds }
            );

            const response: BuyerResponseDtoType = {
                success: true,
                message: "Logged in as buyer successfully.",
                status: 200,
                token,
                user: this.normalizeForResponse(user, buyerProfile)
            };
            return response;
        }

        throw new HttpError(400, "Invalid role! Role is unknown.");
    };

    forgotPassword = async (forgotPasswordDto: ForgotPasswordDtoType): Promise<BuyerResponseDtoType | null> => {
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

        const existingBuyerByBaseUserId = await this.buyerRepo.findBuyerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingBuyerByBaseUserId) {
            throw new HttpError(404, "Buyer with this base user id not found!");
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
            existingBuyerByBaseUserId.fullName,
            email,
            otp
        );

        if (!emailResponse.success) {
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Reset Password instructions have been sent to your email",
            status: 200,
        };
        return response;
    };

    verifyOtpForResetpassword = async (verifyOtpForResetPasswordDto: VerifyOtpForResetPasswordDtoType): Promise<BuyerResponseDtoType> => {
        const { email, otp } = verifyOtpForResetPasswordDto;

        if (!email || email.trim() === '') {
            throw new HttpError(400, "Email is required!");
        }

        if (!otp || otp.trim() === '') {
            throw new HttpError(400, "OTP is required!");
        }

        const decodedEmail = decodeURIComponent(email);
        const existingUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

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

        // const updatedUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
        //     verifyEmailResetPassword: null,
        //     verifyEmailResetPasswordExpiryDate: null,
        // });

        // if (!updatedUser) {
        //     throw new HttpError(404, "User is not updated and not found!");
        // }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Account verified successfully. You can now reset your password.",
            status: 200,
        };
        return response;
    };

    resetPassword = async (resetPasswordDto: ResetPasswordDtoType): Promise<BuyerResponseDtoType> => {
        const { email, newPassword } = resetPasswordDto;

        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        if (!newPassword || newPassword.trim() === "") {
            throw new HttpError(400, "New password is required!");
        }

        const decodedEmail = decodeURIComponent(email);
        const existingUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);

        if (!existingUserByEmail) {
            throw new HttpError(404, "User with this email does not exist!");
        }

        if (!existingUserByEmail.verifyEmailResetPassword || !existingUserByEmail.verifyEmailResetPasswordExpiryDate) {
            throw new HttpError(400, "No OTP request found! Please request for a new OTP.");
        }

        if (new Date() > existingUserByEmail.verifyEmailResetPasswordExpiryDate) {
            throw new HttpError(400, "OTP has expired! Please request for a new OTP.");
        }

        const existingBuyerByBaseUserId = await this.buyerRepo.findBuyerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingBuyerByBaseUserId) {
            throw new HttpError(404, "Buyer with this base user id not found!");
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

        const updatedBuyer = await this.buyerRepo.updateBuyer(existingBuyerByBaseUserId._id.toString(), {
            password: hashedPassword
        });

        if (!updatedBuyer) {
            throw new HttpError(404, "Buyer is not updated and not found!");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: "Password reset successfully. You can now login with your new password.",
            status: 200,
        };
        return response;
    };

    handleSendEmailForRegistration = async (sendEmailForRegistrationDto: SendEmailForRegistrationDtoType): Promise<BuyerResponseDtoType> => {
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

        const existingBuyerByBaseUserId = await this.buyerRepo.findBuyerByBaseUserId(existingUserByEmail._id.toString());
        if (!existingBuyerByBaseUserId) {
            throw new HttpError(404, "Buyer with this base user id not found!");
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

        const emailResponse = await sendVerificationEmail(existingBuyerByBaseUserId.fullName, email, otp);
        if (!emailResponse.success) {
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email! Try again later.");
        }

        const response: BuyerResponseDtoType = {
            success: true,
            message: emailResponse.message ?? "Verification email sent successfully. Please check your inbox.",
            status: 200,
            user: {
                _id: existingBuyerByBaseUserId._id.toString(),
                userId: existingBuyerByBaseUserId.userId.toString(),
                fullName: existingBuyerByBaseUserId.fullName,
                username: existingBuyerByBaseUserId.username,
                contact: existingBuyerByBaseUserId.contact,
                profilePictureUrl: existingUserByEmail.profilePictureUrl,
                bio: existingBuyerByBaseUserId.bio,
                terms: existingBuyerByBaseUserId.terms,
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

    logoutBuyer = async (): Promise<BuyerResponseDtoType> => {
        const response: BuyerResponseDtoType = {
            success: true,
            message: "Logged out successfully.",
            status: 200,
        };
        return response;
    };
}