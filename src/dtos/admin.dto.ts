// src/dtos/admin.dto.ts
import { z } from "zod";
import { fullNameValidation, emailValidation, contactValidation, otpValidation, passwordValidation, roleValidation } from "./../schemas/user.schema.ts";


// Create Admin DTO
export const CreatedAdminDto = z.object({
    fullName: fullNameValidation,
    email: emailValidation,
    contact: contactValidation,
    password: passwordValidation,
    role: roleValidation
});
export type CreatedAdminDtoType = z.infer<typeof CreatedAdminDto>;

// Verify OTP for Registration DTO
export const VerifyOtpForRegistrationDto = z.object({
    email: emailValidation,
    otp: otpValidation,
});
export type VerifyOtpForRegistrationDtoType = z.infer<typeof VerifyOtpForRegistrationDto>;

// Login Admin DTO
export const LoginAdminDto = z.object({
    identifier: z
        .string()
        .min(3, { message: "Email is required" }),
    password: passwordValidation,
    role: roleValidation
});
export type LoginAdminDtoType = z.infer<typeof LoginAdminDto>;

// Forgot Password DTO
export const ForgotPasswordDto = z.object({
    email: emailValidation
});
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;

// Verify OTP for Reset Password DTO
export const VerifyOtpForResetPasswordDto = z.object({
    email: emailValidation,
    otp: otpValidation
});
export type VerifyOtpForResetPasswordDtoType = z.infer<typeof VerifyOtpForResetPasswordDto>;

// Reset Password DTO
export const ResetPasswordDto = z.object({
    email: emailValidation,
    newPassword: passwordValidation
});

export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;

// Send Email for Registration DTO
export const SendEmailForRegistrationDto = z.object({
    email: emailValidation,
});
export type SendEmailForRegistrationDtoType = z.infer<typeof SendEmailForRegistrationDto>;

// -------------------------------- Admin CRUD DTOs -------------------------------------
// Get Admin By Email DTO
export const GetAdminByEmailDto = z.object({
    email: emailValidation
});
export type GetAdminByEmailDtoType = z.infer<typeof GetAdminByEmailDto>;

// Get Current Admin DTO
export const GetCurrentAdminDto = z.object({
    id: z.string()
});
export type GetCurrentAdminDtoType = z.infer<typeof GetCurrentAdminDto>;

// Get Admin By Id DTO
export const GetAdminByIdDto = z.object({
    id: z.string()
});
export type GetAdminByIdType = z.infer<typeof GetAdminByIdDto>;

// Admin Response
export const AdminResponseDto = z.object({
    _id: z.string(),
    email: z.email(),
    role: z.string(),
    isVerified: z.boolean(),
    baseUserId: z.string(),
    fullName: z.string().nullish(),
    contact: z.string().nullish(),
    profilePictureUrl: z.string().nullish(),
    isPermanentlyBanned: z.boolean(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
});

export type AdminResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    token?: string | null;
    user?: z.infer<typeof AdminResponseDto> | null;
};