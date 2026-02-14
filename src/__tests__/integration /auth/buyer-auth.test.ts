// src/__test__/integration/auth/buyer-auth.test.ts
import request from "supertest";
import app from "./../../../app.ts";
import UserModel from "./../../../models/user.model.ts";
import BuyerModel from "./../../../models/buyer.model.ts";
// import { jest } from '@jest/globals';
// import { ApiResponseType } from "./../../types/api-response.type.ts";


// jest.mock("./../../helpers/send-registration-verification-email.ts", () => ({
//     sendVerificationEmail: jest.fn<(fullName: string, email: string, otp: string) => Promise<ApiResponseType>>(),
// }));

// jest.mock("./../../helpers/send-reset-password-verification-email.ts", () => ({
//     sendResetPasswordVerificationEmail: jest.fn<(fullName: string, email: string, otp: string) => Promise<ApiResponseType>>(),
// }));

// import { sendVerificationEmail } from "./../../helpers/send-registration-verification-email.ts";
// import { sendResetPasswordVerificationEmail } from "./../../helpers/send-reset-password-verification-email.ts";

// const mockedSendVerificationEmail =
//     sendVerificationEmail as jest.MockedFunction<typeof sendVerificationEmail>;

// const mockedSendResetPasswordVerificationEmail =
//     sendResetPasswordVerificationEmail as jest.MockedFunction<typeof sendResetPasswordVerificationEmail>;

// // const mockedSendVerificationEmail = jest.fn<(fullName: string, email: string, otp: string) => Promise<ApiResponseType>>();
// // const mockedSendResetPasswordVerificationEmail = jest.fn<(fullName: string, email: string, otp: string) => Promise<ApiResponseType>>();



// jest.mock("./../../helpers/send-registration-verification-email.ts", () => ({
//     sendVerificationEmail: jest.fn<(fullName: string, email: string, otp: string) => Promise<ApiResponseType>>().mockResolvedValue({
//         success: true,
//         message: "Mocked email sent successfully."
//     }),
// }));

// jest.mock("./../../helpers/send-reset-password-verification-email.ts", () => ({
//     sendResetPasswordVerificationEmail: jest.fn<(fullName: string, email: string, otp: string) => Promise<ApiResponseType>>().mockResolvedValue({
//         success: true,
//         message: "Mocked reset email sent."
//     }),
// }));

describe(
    "Buyer Authentication Integration Tests",
    () => {
        const unique = Date.now() + Math.random().toString(36).slice(2, 8);
        const testUser = {
            fullName: "Test User",
            email: "testbuyer@gmail.com",
            // email: `test+${unique}@example.com`,
            // username: `Testuser20`,
            // contact: "9864922251",
            username: "BuyerTest1",
            contact: "9864922260",
            password: "Password@123",
            confirmPassword: "Password@123",
            terms: true,
            role: "buyer"
        };

        beforeAll(async () => {
            await cleanupTestData();
        });

        afterAll(async () => {
            await cleanupTestData();
        });

        const cleanupTestData = async () => {
            await UserModel.deleteMany({ email: testUser.email });
            await BuyerModel.deleteMany({ username: testUser.username });
        };

        // afterEach(async () => {
        //     await cleanupTestData();
        // });

        // beforeEach(() => {
        //     // Reset default behavior before each test
        //     // mockedSendVerificationEmail.mockReset();
        //     // mockedSendResetPasswordVerificationEmail.mockReset();


        //     mockedSendVerificationEmail.mockResolvedValue({
        //         success: true,
        //         message: "Mocked email sent successfully.",
        //     });

        //     mockedSendResetPasswordVerificationEmail.mockResolvedValue({
        //         success: true,
        //         message: "Mocked reset email sent.",
        //     });
        // });


        const signUpEndPoint = "/api/users/buyer/sign-up";

        describe(
            `POST ${signUpEndPoint}`,
            () => {
                test(
                    "should sign up a new buyer user and return 201",
                    async () => {
                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testUser);

                        await UserModel.updateOne(
                            { email: testUser.email },
                            { $set: { isVerified: true } }
                        );

                        const baseUser = await UserModel.findOne({ email: testUser.email });
                        if (!baseUser) {
                            throw new Error("Base user not found");
                        }

                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty("success", true);
                        expect(response.body.message).toMatch(/registered successfully/i);
                        expect(response.body).toHaveProperty("token");
                        expect(response.body.user).toHaveProperty("email", testUser.email);
                        expect(baseUser).toHaveProperty("isVerified", true);
                    },
                    20000
                );

                test(
                    "should not register buyer with existing email and return 409",
                    async () => {
                        const testUserData2 = {
                            fullName: "Test Timi",
                            email: "testbuyer@gmail.com",
                            username: "BuyerTest2",
                            contact: "9864922261",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            terms: true,
                            role: "buyer"
                        }

                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testUserData2);

                        // console.log("Ok: ", response.body);


                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty("success", false);
                        expect(response.body).toHaveProperty("message", "Email already registered!");
                    },
                    20000
                );

                test(
                    "should not register buyer with existing username and return 409",
                    async () => {
                        const testUserData3 = {
                            fullName: "Test Maxu",
                            email: "testbuyer@gmail.com",
                            username: "BuyerTest1",
                            contact: "9864922263",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            terms: true,
                            role: "buyer"
                        }

                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testUserData3);

                        // console.log("Ok: ", response.body);

                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty("success", false);
                        expect(response.body).toHaveProperty("message", "Username already exists!");
                    },
                    20000
                );

                test(
                    "should not register buyer with existing contact and return 409",
                    async () => {
                        const testUserData3 = {
                            fullName: "Test Maxu",
                            email: "testbuyer@gmail.com",
                            username: "BuyerTest3",
                            contact: "9864922260",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            terms: true,
                            role: "buyer"
                        }

                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testUserData3);

                        // console.log("Ok: ", response.body);

                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty("success", false);
                        expect(response.body).toHaveProperty("message", "Contact already exists!");
                    },
                    20000
                );
            }
        );
    }
);