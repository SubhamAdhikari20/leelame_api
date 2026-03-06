// src/__tests__/integration/auth/seller-auth.test.ts
import request from "supertest";
import app from "../../../app.ts";
import UserModel from "../../../models/user.model.ts";
import SellerModel from "../../../models/seller.model.ts";

describe("Seller Authentication Integration Tests", () => {
    const unique = Date.now() + Math.random().toString(36).slice(2, 8);
    const testSellerData1 = {
        fullName: "Test Seller",
        email: `testseller${unique}@gmail.com`,
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
    const forgotPasswordEndPoint = "/api/users/seller/forgot-password";

    describe(`POST ${signUpEndPoint}`, () => {
        test("should sign up a new seller user and return 201", async () => {
            const response = await request(app).post(signUpEndPoint).send(testSellerData1);
            await UserModel.updateOne({ email: testSellerData1.email }, { $set: { isVerified: true } });
            const baseUser = await UserModel.findOne({ email: testSellerData1.email });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/registered successfully/i);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user.email).toBe(testSellerData1.email);
            expect(baseUser?.isVerified).toBe(true);
        }, 20000);

        test("should not register seller with existing email and return 409", async () => {
            const response = await request(app).post(signUpEndPoint).send(testSellerData1);
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Email already registered!");
        }, 20000);

        test("should not register seller with existing contact and return 409", async () => {
            const response = await request(app).post(signUpEndPoint).send({ ...testSellerData1, email: `dup${unique}@gmail.com` });
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Contact already exists!");
        }, 20000);

        test("should not register seller when passwords do not match and return 400", async () => {
            const response = await request(app).post(signUpEndPoint).send({ ...testSellerData1, confirmPassword: "WrongPass@123" });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);
    });

    describe(`POST ${forgotPasswordEndPoint}`, () => {
        test("should send forgot password email for valid seller and return 200", async () => {
            const response = await request(app).post(forgotPasswordEndPoint).send({ email: testSellerData1.email, role: "seller" });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);
    });
});


// // src/__test__/integration/auth/seller-auth.test.ts
// import request from "supertest";
// import app from "./../../../app.ts";
// import UserModel from "./../../../models/user.model.ts";
// import SellerModel from "./../../../models/seller.model.ts";


// describe(
//     "Seller Authentication Integration Tests",
//     () => {
//         const testSellerData1 = {
//             fullName: "Test Seller",
//             email: "testseller@gmail.com",
//             contact: "9864922251",
//             password: "Password@123",
//             confirmPassword: "Password@123",
//             role: "seller"
//         };

//         beforeAll(async () => {
//             await cleanupTestData();
//         });

//         afterAll(async () => {
//             await cleanupTestData();
//         });

//         const cleanupTestData = async () => {
//             await UserModel.deleteMany({ email: testSellerData1.email });
//             await SellerModel.deleteMany({ contact: testSellerData1.contact });
//         };

//         const signUpEndPoint = "/api/users/seller/sign-up";

//         describe(
//             `POST ${signUpEndPoint}`,
//             () => {
//                 test(
//                     "should sign up a new seller user and return 201",
//                     async () => {
//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testSellerData1);

//                         await UserModel.updateOne(
//                             { email: testSellerData1.email },
//                             { $set: { isVerified: true } }
//                         );

//                         const baseUser = await UserModel.findOne({ email: testSellerData1.email });
//                         if (!baseUser) {
//                             throw new Error("Base user not found");
//                         }

//                         expect(response.status).toBe(201);
//                         expect(response.body).toHaveProperty("success", true);
//                         expect(response.body.message).toMatch(/registered successfully/i);
//                         expect(response.body).toHaveProperty("token");
//                         expect(response.body.user).toHaveProperty("email", testSellerData1.email);
//                         expect(baseUser).toHaveProperty("isVerified", true);
//                     },
//                     20000
//                 );

//                 test(
//                     "should not register buyer with existing email and return 409",
//                     async () => {
//                         const testSellerData2 = {
//                             fullName: "Test Opp",
//                             email: "testseller@gmail.com",
//                             contact: "9864922252",
//                             password: "Password@123",
//                             confirmPassword: "Password@123",
//                             role: "seller"
//                         }

//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testSellerData2);

//                         expect(response.status).toBe(409);
//                         expect(response.body).toHaveProperty("success", false);
//                         expect(response.body).toHaveProperty("message", "Email already registered!");
//                     },
//                     20000
//                 );

//                 test(
//                     "should not register seller with existing contact and return 409",
//                     async () => {
//                         const testSellerData3 = {
//                             fullName: "Test Timi",
//                             email: "testseller@gmail.com",
//                             contact: "9864922251",
//                             password: "Password@123",
//                             confirmPassword: "Password@123",
//                             role: "seller"
//                         }

//                         const response = await request(app)
//                             .post(signUpEndPoint)
//                             .send(testSellerData3);

//                         expect(response.status).toBe(409);
//                         expect(response.body).toHaveProperty("success", false);
//                         expect(response.body).toHaveProperty("message", "Contact already exists!");
//                     },
//                     20000
//                 );
//             }
//         );
//     }
// );