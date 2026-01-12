// src/dtos/buyer.dto.ts
import { z } from "zod";
import { fullNameValidation, usernameValidation, contactValidation, emailValidation, passwordValidation, roleValidation, otpValidation, termsAndConditionsValidation } from "./../schemas/user.schema.ts";


// Create Buyer DTO
export const CreatedBuyerDto = z.object({
    fullName: fullNameValidation,
    username: usernameValidation,
    contact: contactValidation,
    password: passwordValidation,
    email: emailValidation,
    role: roleValidation,
    terms: termsAndConditionsValidation,
});
export type CreatedBuyerDtoType = z.infer<typeof CreatedBuyerDto>;

// Check Username Unique DTO
export const CheckUsernameUniqueDto = z.object({
    username: usernameValidation
});
export type CheckUsernameUniqueDtoType = z.infer<typeof CheckUsernameUniqueDto>;

// Login Buyer DTO
export const LoginBuyerDto = z.object({
    identifier: z
        .string()
        .min(3, { message: "Username or Email is required" }),
    password: passwordValidation,
    role: roleValidation
});
export type LoginBuyerDtoType = z.infer<typeof LoginBuyerDto>;

// Forgot Password DTO
export const ForgotPasswordDto = z.object({
    email: emailValidation
});
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;

// Verify OTP for Registration DTO
export const VerifyOtpForRegistrationDto = z.object({
    username: usernameValidation,
    otp: otpValidation,
});
export type VerifyOtpForRegistrationDtoType = z.infer<typeof VerifyOtpForRegistrationDto>;

// Verify OTP for Reset Password DTO
export const VerifyOtpForResetPasswordDto = z.object({
    email: emailValidation,
    otp: otpValidation
});
export type VerifyOtpForResetPasswordDtoType = z.infer<typeof VerifyOtpForResetPasswordDto>;


export const ResetPasswordDto = z.object({
    email: emailValidation,
    newPassword: passwordValidation
});

export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;

// Verify OTP for Registration DTO
export const SendEmailForRegistrationDto = z.object({
    email: emailValidation,
});
export type SendEmailForRegistrationDtoType = z.infer<typeof SendEmailForRegistrationDto>;


// what server responds with when sending user data 
export const BuyerResponseDto = z.object({
    _id: z.string(),
    email: z.email(),
    userId: z.string(),
    isVerified: z.boolean(),
    fullName: z.string().nullish(),
    username: z.string().nullish(),
    contact: z.string().nullish(),
    profilePictureUrl: z.string().nullish(),
    bio: z.string().nullish(),
    role: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
    isPermanentlyBanned: z.boolean(),
});

export type BuyerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    token?: string | null;
    user?: z.infer<typeof BuyerResponseDto> | null;
    // user?: Partial<UserDocument> & Partial<BuyerDocument> | null;
};