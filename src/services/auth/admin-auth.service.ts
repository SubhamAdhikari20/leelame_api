// src/services/auth/admin-auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AdminResponseDtoType, CreatedAdminDtoType, VerifyOtpForRegistrationDtoType, LoginAdminDtoType, ForgotPasswordDtoType, VerifyOtpForResetPasswordDtoType, ResetPasswordDtoType, SendEmailForRegistrationDtoType } from "./../../dtos/admin.dto.ts";
import type { UserRepositoryInterface } from "./../../interfaces/user.repository.interface.ts";
import type { AdminRepositoryInterface } from "./../../interfaces/admin.repository.interface.ts";
import { sendVerificationEmail } from "./../../helpers/send-registration-verification-email.ts";
import { sendResetPasswordVerificationEmail } from "./../../helpers/send-reset-password-verification-email.ts";
import { HttpError } from "./../../errors/http-error.ts";


export class AdminAuthService {
    private userRepo: UserRepositoryInterface;
    private adminRepo: AdminRepositoryInterface;

    constructor(
        userRepo: UserRepositoryInterface,
        adminRepo: AdminRepositoryInterface
    ) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
    }

    private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    private normalizeForResponse = (baseUser: any, profile: any) => {
        return {
            _id: (profile && (baseUser.role === "buyer")) ? profile._id.toString() : profile._id,
            email: baseUser.email,
            role: baseUser.role,
            baseUserId: (profile.baseUserId || baseUser._id) ? profile.baseUserId.toString() : baseUser._id.toString(),
            isVerified: baseUser.isVerified,
            fullName: profile.fullName ?? null,
            username: profile.username ?? null,
            contact: profile.contact ?? null,
            isPermanentlyBanned: baseUser.isPermanentlyBanned,
        };
    };

    createAdmin = async (adminData: CreatedAdminDtoType): Promise<AdminResponseDtoType | null> => {
        const { fullName, email, contact, password, role } = adminData;

        // Check existing user
        const existingUserByEmail = await this.userRepo.findUserByEmail(email);

        // Check for existing contact number
        const existingAdminByContact = await this.adminRepo.findAdminByContact(contact);
        if (existingAdminByContact && existingUserByEmail?.isVerified === true) {
            throw new HttpError(400, "Contact already exists!");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Add 10 mins from 'now'

        let newUser;
        let adminProfile;
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

            // If adminProfile does not exist for this user, create one
            adminProfile = await this.adminRepo.findAdminById(newUser._id.toString());

            if (!adminProfile) {
                adminProfile = await this.adminRepo.createAdmin({
                    baseUserId: newUser._id.toString(),
                    fullName,
                    contact,
                    password: hashedPassword,
                });

                isNewProfileCreated = true;
            }
            else {
                // Update if exists
                adminProfile = await this.adminRepo.updateAdmin(adminProfile._id.toString(), {
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

            adminProfile = await this.adminRepo.createAdmin({
                baseUserId: newUser._id.toString(),
                fullName,
                contact,
                password: hashedPassword,
            });

            isNewUserCreated = true;
        }

        if (!adminProfile) {
            throw new HttpError(404, "Admin with this id not found!");
        }

        // JWT Expiry Calculation in seconds for Signup Token
        const secondsInAYear = 365 * 24 * 60 * 60;
        const expiresInSeconds = Number(process.env.JWT_SIGNUP_EXPIRES_IN) * secondsInAYear;

        // Generate Token
        const token = jwt.sign(
            { _id: newUser?._id, email: newUser?.email, contact: adminProfile?.contact, role: newUser?.role },
            process.env.JWT_SECRET!,
            { expiresIn: expiresInSeconds }
        );

        // Send verification email
        const emailResponse = await sendVerificationEmail(fullName, email, otp);
        if (!emailResponse.success) {
            // Rollback user creation if email sending fails
            if (isNewUserCreated) {
                await this.userRepo.deleteUser(newUser._id.toString());
                await this.adminRepo.deleteAdmin(adminProfile._id.toString());
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
                    await this.adminRepo.deleteAdmin(adminProfile._id.toString());
                }
            }
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email!");
        }

        const respose: AdminResponseDtoType = {
            success: true,
            message: "User registered successfully. Please verify your email.",
            status: 201,
            token,
            user: {
                _id: adminProfile._id.toString(),
                baseUserId: adminProfile.baseUserId.toString(),
                email: newUser.email,
                fullName: adminProfile.fullName,
                contact: adminProfile.contact,
                role: newUser.role,
                isVerified: newUser.isVerified,
                isPermanentlyBanned: newUser.isPermanentlyBanned,
            }
        };
        return respose;
    };

    verifyOtpForRegistration = async (verifyOtpForRegistrationDto: VerifyOtpForRegistrationDtoType): Promise<AdminResponseDtoType> => {
        const { email, otp } = verifyOtpForRegistrationDto;

        if (!email || email.trim() === "") {
            throw new HttpError(400, "Email is required!");
        }

        if (!otp || otp.trim() === "") {
            throw new HttpError(400, "OTP is required!");
        }

        const decodedEmail = decodeURIComponent(email);
        const existingUserByEmail = await this.userRepo.findUserByEmail(decodedEmail);
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

        const updatedUser = await this.userRepo.updateUser(existingUserByEmail._id.toString(), {
            isVerified: true,
            verifyCode: null,
            verifyCodeExpiryDate: null,
        });

        if (!updatedUser) {
            throw new HttpError(404, "User is not updated and not found!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Account verified successfully. You can now login.",
            status: 200,
        };
        return response;
    };

    loginAdmin = async (loginAdminDto: LoginAdminDtoType): Promise<AdminResponseDtoType | null> => {
        const { identifier, password, role } = loginAdminDto;
        if (!role) {
            throw new HttpError(400, "User role is required!");
        }

        if (!identifier || !password) {
            throw new HttpError(400, "Missing credentails! Credentails are required!");
        }

        if (role === "admin") {
            const isEmailFormat = this.emailRegex.test(identifier);

            if (!isEmailFormat) {
                throw new HttpError(400, "Invalid identifier! Identifier must be a valid email.");
            }

            const user = await this.userRepo.findUserByEmail(identifier);
            if (!user || user.role !== role) {
                throw new HttpError(404, "Invalid email! No admin account found with this email.");
            }

            const adminProfile = await this.adminRepo.findAdminByBaseUserId(user._id.toString());
            if (!adminProfile) {
                throw new HttpError(404, "Admin user not found for this email.");
            }

            const hashedPassword = adminProfile.password;
            if (!hashedPassword) {
                throw new HttpError(400, "Password not found for admin!");
            }

            const isMatched = await bcrypt.compare(password, hashedPassword);
            if (!isMatched) {
                throw new HttpError(400, "Invalid password! Please enter correct password.");
            }

            // JWT Expiry Calculation in seconds for Login Token (1 Day)
            const expiresInSeconds = Number(process.env.JWT_LOGIN_EXPIRES_IN) * 60 * 60;

            // Generate Token
            const token = jwt.sign(
                { _id: adminProfile._id.toString(), baseUserId: user._id.toString() || adminProfile.baseUserId.toString(), email: user.email, phoneNumber: adminProfile.contact, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: expiresInSeconds }
            );

            const response: AdminResponseDtoType = {
                success: true,
                message: "Logged in as admin successfully.",
                status: 200,
                token,
                user: this.normalizeForResponse(user, adminProfile)
            };
            return response;
        }

        throw new HttpError(400, "Invalid role! Role is unknown.");
    };

    forgotPassword = async (forgotPasswordDto: ForgotPasswordDtoType): Promise<AdminResponseDtoType | null> => {
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

        const existingAdminByBaseUserId = await this.adminRepo.findAdminByBaseUserId(existingUserByEmail._id.toString());
        if (!existingAdminByBaseUserId) {
            throw new HttpError(404, "Admin with this base user id not found!");
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
            existingAdminByBaseUserId.fullName,
            email,
            otp
        );

        if (!emailResponse.success) {
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Reset Password instructions have been sent to your email",
            status: 200,
        };
        return response;
    };

    verifyOtpForResetpassword = async (verifyOtpForResetPasswordDto: VerifyOtpForResetPasswordDtoType): Promise<AdminResponseDtoType> => {
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

        const response: AdminResponseDtoType = {
            success: true,
            message: "Account verified successfully. You can now login.",
            status: 200,
        };
        return response;
    };

    resetPassword = async (resetPasswordDto: ResetPasswordDtoType): Promise<AdminResponseDtoType> => {
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

        const existingAdminByBaseUserId = await this.adminRepo.findAdminByBaseUserId(existingUserByEmail._id.toString());
        if (!existingAdminByBaseUserId) {
            throw new HttpError(404, "Admin with this base user id not found!");
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

        const updatedAdmin = await this.adminRepo.updateAdmin(existingAdminByBaseUserId._id.toString(), {
            password: hashedPassword
        });

        if (!updatedAdmin) {
            throw new HttpError(404, "Admin is not updated and not found!");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: "Account verified successfully. You can now login.",
            status: 200,
        };
        return response;
    };

    handleSendEmailForRegistration = async (sendEmailForRegistrationDto: SendEmailForRegistrationDtoType): Promise<AdminResponseDtoType> => {
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

        const existingAdminByBaseUserId = await this.adminRepo.findAdminByBaseUserId(existingUserByEmail._id.toString());
        if (!existingAdminByBaseUserId) {
            throw new HttpError(404, "Admin with this base user id not found!");
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

        const emailResponse = await sendVerificationEmail(existingAdminByBaseUserId.fullName, email, otp);
        if (!emailResponse.success) {
            throw new HttpError(500, emailResponse.message ?? "Failed to send verification email! Try again later.");
        }

        const response: AdminResponseDtoType = {
            success: true,
            message: emailResponse.message ?? "Verification email sent successfully. Please check your inbox.",
            status: 200,
            user: {
                _id: existingAdminByBaseUserId._id.toString(),
                baseUserId: existingAdminByBaseUserId.baseUserId.toString(),
                email: existingUserByEmail.email,
                fullName: existingAdminByBaseUserId.fullName,
                contact: existingAdminByBaseUserId.contact,
                role: existingUserByEmail.role,
                isVerified: existingUserByEmail.isVerified,
                isPermanentlyBanned: existingUserByEmail.isPermanentlyBanned,
            }
        };
        return response;
    };
}