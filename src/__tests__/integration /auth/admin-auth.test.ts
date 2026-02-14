// src/__test__/integration/auth/admin-auth.test.ts
import request from "supertest";
import app from "./../../../app.ts";
import UserModel from "./../../../models/user.model.ts";
import AdminModel from "./../../../models/admin.model.ts";


describe(
    "Admin Authentication Integration Tests",
    () => {
        const testAdminData1 = {
            fullName: "Test Admin",
            email: "testadmin@gmail.com",
            contact: "9864922241",
            password: "Password@123",
            confirmPassword: "Password@123",
            role: "admin"
        };

        beforeAll(async () => {
            await cleanupTestData();
        });

        afterAll(async () => {
            await cleanupTestData();
        });

        const cleanupTestData = async () => {
            await UserModel.deleteMany({ email: testAdminData1.email });
            await AdminModel.deleteMany({ contact: testAdminData1.contact });
        };

        const signUpEndPoint = "/api/users/admin/sign-up";

        describe(
            `POST ${signUpEndPoint}`,
            () => {
                test(
                    "should sign up a new admin user and return 201",
                    async () => {
                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testAdminData1);

                        await UserModel.updateOne(
                            { email: testAdminData1.email },
                            { $set: { isVerified: true } }
                        );

                        const baseUser = await UserModel.findOne({ email: testAdminData1.email });
                        if (!baseUser) {
                            throw new Error("Base user not found");
                        }

                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty("success", true);
                        expect(response.body.message).toMatch(/registered successfully/i);
                        expect(response.body).toHaveProperty("token");
                        expect(response.body.user).toHaveProperty("email", testAdminData1.email);
                        expect(baseUser).toHaveProperty("isVerified", true);
                    },
                    20000
                );

                test(
                    "should not register admin with existing email and return 409",
                    async () => {
                        const testAdminData2 = {
                            fullName: "Test Opp",
                            email: "testadmin@gmail.com",
                            contact: "9864922242",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            role: "admin"
                        }

                        const response = await request(app)
                            .post(signUpEndPoint)
                            .send(testAdminData2);

                        expect(response.status).toBe(409);
                        expect(response.body).toHaveProperty("success", false);
                        expect(response.body).toHaveProperty("message", "Email already registered!");
                    },
                    20000
                );

                test(
                    "should not register admin with existing contact and return 409",
                    async () => {
                        const testSellerData3 = {
                            fullName: "Test Timi",
                            email: "testseller@gmail.com",
                            contact: "9864922241",
                            password: "Password@123",
                            confirmPassword: "Password@123",
                            role: "admin"
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