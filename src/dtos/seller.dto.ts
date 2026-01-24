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

// Get Seller By Id DTO
export const GetSellerByIdDto = z.object({
    id: z.string()
});
export type GetSellerByIdType = z.infer<typeof GetSellerByIdDto>;


// Seller Response
// export const SellerResponseDto = z.object({
//     _id: z.string(),
//     email: z.email(),
//     userId: z.string(),
//     isVerified: z.boolean(),
//     fullName: z.string().optional().nullish(),
//     contact: z.string().optional().nullish(),
//     profilePictureUrl: z.string().optional().nullish(),
//     bio: z.string().optional().nullish(),
//     role: z.string().optional().nullish(),
//     createdAt: z.date().optional(),
//     updatedAt: z.date().optional(),
//     isPermanentlyBanned: z.boolean(),
// });

export const SellerResponseDto = z.object({
    _id: z.string(),
    userId: z.string(),
    fullName: z.string().nullish(),
    contact: z.string().nullish(),
    profilePictureUrl: z.string().nullish(),
    bio: z.string().nullish(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
    baseUser: z.object({
        _id: z.string(),
        email: z.email(),
        role: z.string().nullish(),
        isVerified: z.boolean(),
        isPermanentlyBanned: z.boolean(),
    }).nullish(),
});

export type SellerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    token?: string | null;
    user?: z.infer<typeof SellerResponseDto> | null;
};