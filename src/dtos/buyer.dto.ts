// src/dtos/buyer.dto.ts
import { z } from "zod";
import { fullNameValidation, usernameValidation, contactValidation, emailValidation, passwordValidation, roleValidation, otpValidation, termsAndConditionsValidation, bioValidation } from "./../schemas/user.schema.ts";


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
    bio: bioValidation,
});
export type UpdateBuyerProfileDetailsDtoType = z.infer<typeof UpdateBuyerProfileDetailsDto>;

// Upload Profile Picture DTO
const multerFileSchema = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional(),
    buffer: z.instanceof(Buffer).optional(),
}).refine((data) => data.mimetype.startsWith("image/"), {
    message: "Only image files are allowed!",
});

export const UploadBuyerProfilePictureDto = z.object({
    // profilePicture: multerFileSchema.refine((file) => !!file, { message: "No file provided! Upload a file." }),
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
});

export type BuyerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    token?: string | null;
    user?: z.infer<typeof BuyerResponseDto> | null;
};

// All the buyers response
export type AllBuyersResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    users?: z.infer<typeof BuyerResponseDto>[] | null;
};

export const UploadImageBuyerResponseDto = z.object({
    imageUrl: z.string()
});

export type UploadImageBuyerResponseDtoType = {
    success: boolean;
    message: string;
    status?: number | null;
    data?: z.infer<typeof UploadImageBuyerResponseDto> | null;
};