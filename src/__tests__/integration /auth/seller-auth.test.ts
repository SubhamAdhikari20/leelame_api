// src/__test__/integration/auth/seller-auth.test.ts
import request from "supertest";
import app from "./../../../app.ts";
import UserModel from "./../../../models/user.model.ts";
import SellerModel from "./../../../models/seller.model.ts";


describe(
    "Seller Authentication Integration Tests",
    () => {
        const testSellerData1 = {
            fullName: "Test Seller",
            email: "testseller@gmail.com",
            contact: "9864922251",
            password: "Password@123",
            confirmPassword: "Password@123",
            role: "seller"
        };

        beforeAll(async () => {
            await cleanupTestData();
        });

        afterAll(async () => {
            await cleanupTestData();
        });

        const cleanupTestData = async () => {
            await UserModel.deleteMany({ email: testSellerData1.email });
            await SellerModel.deleteMany({ contact: testSellerData1.contact });
        };

        const signUpEndPoint = "/api/users/seller/sign-up";

        describe(
            `POST ${signUpEndPoint}`,
            () => {
                test(
                    "should sign up a new seller user and return 201",
                    async () => {
                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testSellerData1);

                        await UserModel.updateOne(
                            { email: testSellerData1.email },
                            { $set: { isVerified: true } }
                        );

                        const baseUser = await UserModel.findOne({ email: testSellerData1.email });
                        if (!baseUser) {
                            throw new Error("Base user not found");
                        }

                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty("success", true);
                        expect(response.body.message).toMatch(/registered successfully/i);
                        expect(response.body).toHaveProperty("token");
                        expect(response.body.user).toHaveProperty("email", testSellerData1.email);
                        expect(baseUser).toHaveProperty("isVerified", true);
                    },
                    20000
                );

                test(
                    "should not register buyer with existing email and return 409",
                    async () => {
                        const testSellerData2 = {
                            fullName: "Test Opp",
                            email: "testseller@gmail.com",
                            contact: "9864922252",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            role: "seller"
                        }

                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testSellerData2);

                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty("success", false);
                        expect(response.body).toHaveProperty("message", "Email already registered!");
                    },
                    20000
                );

                test(
                    "should not register seller with existing contact and return 409",
                    async () => {
                        const testSellerData3 = {
                            fullName: "Test Timi",
                            email: "testseller@gmail.com",
                            contact: "9864922251",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            role: "seller"
                        }

                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testSellerData3);

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