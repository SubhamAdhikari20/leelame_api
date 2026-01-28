// src/dtos/buyer.dto.ts
import { z } from "zod";
import { fullNameValidation, usernameValidation, contactValidation, emailValidation, passwordValidation, roleValidation, otpValidation, termsAndConditionsValidation } from "./../schemas/user.schema.ts";


// --------------------------- Buyer Authentication DTOs ----------------------------
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



// -------------------------------- Buyer CRUD DTOs -------------------------------------
// Get Buyer By Email DTO
export const GetBuyerByEmailDto = z.object({
    email: emailValidation
});
export type GetBuyerByEmailDtoType = z.infer<typeof GetBuyerByEmailDto>;

// Get Current Buyer DTO
export const GetCurrentBuyerDto = z.object({
    id: z.string()
});
export type GetCurrentBuyerDtoType = z.infer<typeof GetCurrentBuyerDto>;

// Get Buyer By Id DTO
export const GetBuyerByIdDto = z.object({
    id: z.string()
});
export type GetBuyerByIdType = z.infer<typeof GetBuyerByIdDto>;

// Update Profile Details DTO
export const UpdateBuyerProfileDetailsDto = z.object({
    fullName: fullNameValidation,
    email: emailValidation,
    username: usernameValidation,
    contact: contactValidation,
    bio: z.string().max(500)
});
export type UpdateBuyerProfileDetailsDtoType = z.infer<typeof UpdateBuyerProfileDetailsDto>;

// Upload Profile Picture DTO
export const UploadBuyerProfilePictureDto = z.object({
    profilePicture: z.instanceof(File, { message: "No file provided! Upload a file." }),
});
export type UploadBuyerProfilePictureDtoType = z.infer<typeof UploadBuyerProfilePictureDto>;


// what server responds with when sending user data 
export const BuyerResponseDto = z.object({
    _id: z.string(),
    email: z.email(),
    baseUserId: z.string(),
    role: z.string(),
    isVerified: z.boolean(),
    fullName: z.string().nullish(),
    username: z.string().nullish(),
    contact: z.string().nullish(),
    isPermanentlyBanned: z.boolean(),
    profilePictureUrl: z.string().nullish(),
    bio: z.string().nullish(),
    createdAt: z.date().nullish(),
    updatedAt: z.date().nullish(),
    // baseUser: z.object({
    //     _id: z.string(),
    //     email: z.email(),
    //     role: z.string(),
    //     isVerified: z.boolean(),
    //     isPermanentlyBanned: z.boolean(),
    // }).nullish(),
});

export type BuyerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    token?: string | null;
    user?: z.infer<typeof BuyerResponseDto> | null;
};

export const UploadImageBuyerResponseDto = z.object({
    imageUrl: z.url()
});

export type UploadImageBuyerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof UploadImageBuyerResponseDto> | null;
};