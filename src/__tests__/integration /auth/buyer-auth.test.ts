// src/__tests__/integration/auth/buyer-auth.test.ts
import request from "supertest";
import app from "../../../app.ts";
import UserModel from "../../../models/user.model.ts";
import BuyerModel from "../../../models/buyer.model.ts";


describe("Buyer Authentication Integration Tests", () => {
    const unique = Date.now() + Math.random().toString(36).slice(2, 8);
    const testUser = {
        fullName: "Test User",
        email: `testbuyer${unique}@gmail.com`,
        username: `BuyerTest${unique}`,
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

    const signUpEndPoint = "/api/users/buyer/sign-up";
    const forgotPasswordEndPoint = "/api/users/buyer/forgot-password";
    const resetPasswordEndPoint = "/api/users/buyer/reset-password";

    describe(`POST ${signUpEndPoint}`, () => {
        test("should sign up a new buyer user and return 201", async () => {
            const response = await request(app).post(signUpEndPoint).send(testUser);
            await UserModel.updateOne({ email: testUser.email }, { $set: { isVerified: true } });
            const baseUser = await UserModel.findOne({ email: testUser.email });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/registered successfully/i);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user.email).toBe(testUser.email);
            expect(baseUser?.isVerified).toBe(true);
        }, 20000);

        test("should not register buyer with existing email and return 409", async () => {
            const response = await request(app).post(signUpEndPoint).send(testUser);
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Email already registered!");
        }, 20000);

        test("should not register buyer with existing username and return 409", async () => {
            const duplicate = { ...testUser, email: `dup${unique}@gmail.com` };
            const response = await request(app).post(signUpEndPoint).send(duplicate);
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Username already exists!");
        }, 20000);

        test("should not register buyer with existing contact and return 409", async () => {
            const duplicate = { ...testUser, email: `dup2${unique}@gmail.com`, username: `DupBuyer${unique}` };
            const response = await request(app).post(signUpEndPoint).send(duplicate);
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Contact already exists!");
        }, 20000);

        test("should not register buyer when passwords do not match and return 400", async () => {
            const response = await request(app).post(signUpEndPoint).send({ ...testUser, confirmPassword: "WrongPass@123" });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        test("should not register buyer with invalid email format and return 400", async () => {
            const response = await request(app).post(signUpEndPoint).send({ ...testUser, email: "invalid-email" });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        test("should not register buyer with missing required fields and return 400", async () => {
            const response = await request(app).post(signUpEndPoint).send({ email: testUser.email });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        test("should not register buyer without accepting terms and return 400", async () => {
            const response = await request(app).post(signUpEndPoint).send({ ...testUser, terms: false });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);
    });

    describe(`POST ${forgotPasswordEndPoint}`, () => {
        test("should send forgot password email for valid buyer and return 200", async () => {
            const response = await request(app).post(forgotPasswordEndPoint).send({ email: testUser.email, role: "buyer" });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);

        test("should return 404 for non-existent email in forgot password", async () => {
            const response = await request(app).post(forgotPasswordEndPoint).send({ email: "nobody@gmail.com", role: "buyer" });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        }, 20000);
    });
});



// // src/__test__/integration/auth/buyer-auth.test.ts
// import request from "supertest";
// import app from "./../../../app.ts";
// import UserModel from "./../../../models/user.model.ts";
// import BuyerModel from "./../../../models/buyer.model.ts";


// describe(
//     "Buyer Authentication Integration Tests",
//     () => {
//         const unique = Date.now() + Math.random().toString(36).slice(2, 8);
//         const testUser = {
//             fullName: "Test User",
//             email: "testbuyer@gmail.com",
//             // email: `test+${unique}@example.com`,
//             // username: `Testuser20`,
//             // contact: "9864922251",
//             username: "BuyerTest1",
//             contact: "9864922260",
//             password: "Password@123",
//             confirmPassword: "Password@123",
//             terms: true,
//             role: "buyer"
//         };

//         beforeAll(async () => {
//             await cleanupTestData();
//         });

//         afterAll(async () => {
//             await cleanupTestData();
//         });

//         const cleanupTestData = async () => {
//             await UserModel.deleteMany({ email: testUser.email });
//             await BuyerModel.deleteMany({ username: testUser.username });
//         };

//         // afterEach(async () => {
//         //     await cleanupTestData();
//         // });

//         // beforeEach(() => {
//         //     // Reset default behavior before each test
//         //     // mockedSendVerificationEmail.mockReset();
//         //     // mockedSendResetPasswordVerificationEmail.mockReset();


//         //     mockedSendVerificationEmail.mockResolvedValue({
//         //         success: true,
//         //         message: "Mocked email sent successfully.",
//         //     });

//         //     mockedSendResetPasswordVerificationEmail.mockResolvedValue({
//         //         success: true,
//         //         message: "Mocked reset email sent.",
//         //     });
//         // });


//         const signUpEndPoint = "/api/users/buyer/sign-up";
//         const forgotPasswordEndPoint = "/api/users/buyer/forgot-password";
//         const resetPasswordEndPoint = "/api/users/buyer/reset-password";

//         describe(
//             `POST ${signUpEndPoint}`,
//             () => {
//                 test(
//                     "should sign up a new buyer user and return 201",
//                     async () => {
//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testUser);

//                         await UserModel.updateOne(
//                             { email: testUser.email },
//                             { $set: { isVerified: true } }
//                         );

//                         const baseUser = await UserModel.findOne({ email: testUser.email });
//                         if (!baseUser) {
//                             throw new Error("Base user not found");
//                         }

//                         expect(response.status).toBe(201);
//                         expect(response.body).toHaveProperty("success", true);
//                         expect(response.body.message).toMatch(/registered successfully/i);
//                         expect(response.body).toHaveProperty("token");
//                         expect(response.body.user).toHaveProperty("email", testUser.email);
//                         expect(baseUser).toHaveProperty("isVerified", true);
//                     },
//                     20000
//                 );

//                 test(
//                     "should not register buyer with existing email and return 409",
//                     async () => {
//                         const testUserData2 = {
//                             fullName: "Test Timi",
//                             email: "testbuyer@gmail.com",
//                             username: "BuyerTest2",
//                             contact: "9864922261",
//                             password: "Password@123",
//                             confirmPassword: "Password@123",
//                             terms: true,
//                             role: "buyer"
//                         }

//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testUserData2);

//                         // console.log("Ok: ", response.body);


//                         expect(response.status).toBe(409);
//                         expect(response.body).toHaveProperty("success", false);
//                         expect(response.body).toHaveProperty("message", "Email already registered!");
//                     },
//                     20000
//                 );

//                 test(
//                     "should not register buyer with existing username and return 409",
//                     async () => {
//                         const testUserData3 = {
//                             fullName: "Test Maxu",
//                             email: "testbuyer@gmail.com",
//                             username: "BuyerTest1",
//                             contact: "9864922263",
//                             password: "Password@123",
//                             confirmPassword: "Password@123",
//                             terms: true,
//                             role: "buyer"
//                         }

//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testUserData3);

//                         // console.log("Ok: ", response.body);

//                         expect(response.status).toBe(409);
//                         expect(response.body).toHaveProperty("success", false);
//                         expect(response.body).toHaveProperty("message", "Username already exists!");
//                     },
//                     20000
//                 );

//                 test(
//                     "should not register buyer with existing contact and return 409",
//                     async () => {
//                         const testUserData3 = {
//                             fullName: "Test Maxu",
//                             email: "testbuyer@gmail.com",
//                             username: "BuyerTest3",
//                             contact: "9864922260",
//                             password: "Password@123",
//                             confirmPassword: "Password@123",
//                             terms: true,
//                             role: "buyer"
//                         }

//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testUserData3);

//                         // console.log("Ok: ", response.body);

//                         expect(response.status).toBe(409);
//                         expect(response.body).toHaveProperty("success", false);
//                         expect(response.body).toHaveProperty("message", "Contact already exists!");
//                     },
//                     20000
//                 );

//                 test("should not register buyer when passwords do not match and return 400", async () => {
//                     const response = await request(app).post(signUpEndPoint).send({
//                         fullName: "Mismatch User",
//                         email: "mismatch@gmail.com",
//                         username: "MismatchBuyer",
//                         contact: "9864922299",
//                         password: "Password@123",
//                         confirmPassword: "WrongPass@123",
//                         terms: true,
//                         role: "buyer",
//                     });

//                     expect(response.status).toBe(400);
//                     expect(response.body).toHaveProperty("success", false);
//                 }, 20000);
//             }
//         );
//     }
// );