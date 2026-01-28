// src/dtos/seller.dto.ts
import { z } from "zod";
import { fullNameValidation, emailValidation, contactValidation, otpValidation, passwordValidation, roleValidation } from "./../schemas/user.schema.ts";


// --------------------------- Seller Authentication DTOs ----------------------------
// Create Seller DTO
export const CreatedSellerDto = z.object({
    fullName: fullNameValidation,
    contact: contactValidation,
    email: emailValidation,
    password: passwordValidation,
    role: roleValidation
});
export type CreatedSellerDtoType = z.infer<typeof CreatedSellerDto>;

// Verify OTP for Registration DTO
export const VerifyOtpForRegistrationDto = z.object({
    email: emailValidation,
    otp: otpValidation
});
export type VerifyOtpForRegistrationDtoType = z.infer<typeof VerifyOtpForRegistrationDto>;

// Login Seller DTO
export const LoginSellerDto = z.object({
    identifier: z
        .string()
        .min(3, { message: "Email or Phone Number is required" }),
    password: passwordValidation,
    role: roleValidation
});
export type LoginSellerDtoType = z.infer<typeof LoginSellerDto>;

// Forgot Password DTO
export const ForgotPasswordDto = z.object({
    email: emailValidation
});
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;

// Verify OTP and Reset Pasword DTO
export const ResetPasswordDto = z.object({
    email: emailValidation,
    otp: otpValidation,
    newPassword: passwordValidation
});
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;

// Send Email for Registration DTO
export const SendEmailForRegistrationDto = z.object({
    email: emailValidation,
});
export type SendEmailForRegistrationDtoType = z.infer<typeof SendEmailForRegistrationDto>;


// -------------------------------- Seller CRUD DTOs -------------------------------------
// Get Seller By Email DTO
export const GetSellerByEmailDto = z.object({
    email: emailValidation
});
export type GetSellerByEmailDtoType = z.infer<typeof GetSellerByEmailDto>;

// Get Current Seller DTO
export const GetCurrentSellerDto = z.object({
    id: z.string()
});
export type GetCurrentSellerDtoType = z.infer<typeof GetCurrentSellerDto>;

// Get Seller By Id DTO
export const GetSellerByIdDto = z.object({
    id: z.string()
});
export type GetSellerByIdType = z.infer<typeof GetSellerByIdDto>;


export const SellerResponseDto = z.object({
    _id: z.string(),
    email: z.email(),
    role: z.string(),
    isVerified: z.boolean(),
    baseUserId: z.string(),
    fullName: z.string().nullish(),
    contact: z.string().nullish(),
    isPermanentlyBanned: z.boolean(),
    profilePictureUrl: z.string().nullish(),
    bio: z.string().nullish(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type SellerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    token?: string | null;
    user?: z.infer<typeof SellerResponseDto> | null;
};