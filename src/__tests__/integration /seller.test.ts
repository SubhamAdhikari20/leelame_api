// src/__tests__/integration/seller.test.ts
import request from "supertest";
import app from "./../../app.ts";
import UserModel from "./../../models/user.model.ts";
import SellerModel from "./../../models/seller.model.ts";


describe("Seller Profile Integration Tests", () => {
    const signUpEndPoint = "/api/users/seller/sign-up";
    const loginEndPoint = "/api/users/seller/login";
    const updateProfileEndPoint = "/api/users/seller/update-profile-details/:id";
    const forgotPasswordEndPoint = "/api/users/seller/forgot-password";

    let token: string;
    let sellerId: string;

    const testSeller = {
        fullName: "Test Seller Profile",
        email: "sellerprofile@gmail.com",
        contact: "9864922251",
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "seller"
    };

    const updateSellerData = {
        fullName: "Updated Seller Name",
        email: "sellerprofile@gmail.com",
        contact: "9856789124",
        bio: "Updated seller bio from integration test",
        shopName: "My Shop"
    };

    beforeAll(async () => {
        await cleanupTestData();
        await request(app).post(signUpEndPoint).send(testSeller);
        const baseUser = await UserModel.findOne({ email: testSeller.email });
        const existingSeller = await SellerModel.findOne({ baseUserId: baseUser?._id.toString() ?? "" });
        sellerId = existingSeller?._id.toString()!;
        await UserModel.updateOne({ _id: baseUser?._id.toString() ?? "" }, { $set: { isVerified: true } });
        const loginResponse = await request(app).post(loginEndPoint).send({
            identifier: testSeller.email,
            password: testSeller.password,
            role: "seller"
        });
        token = loginResponse.body.token;
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    const cleanupTestData = async () => {
        await UserModel.deleteMany({ email: testSeller.email });
        await SellerModel.deleteMany({ contact: testSeller.contact });
    };

    describe(`PUT ${updateProfileEndPoint}`, () => {
        test("should update seller profile details and return 200", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", sellerId))
                .set("Authorization", `Bearer ${token}`)
                .send(updateSellerData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Seller profile details updated successfully.");
        }, 20000);

        test("should reject update without token and return 400", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", sellerId))
                .send(updateSellerData);
            expect(response.status).toBe(401);
        }, 20000);

        test("should reject update with invalid seller id and return 400", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", "invalidid123"))
                .set("Authorization", `Bearer ${token}`)
                .send(updateSellerData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);
    });

    describe(`POST ${loginEndPoint}`, () => {
        test("should login verified seller and return 200", async () => {
            const response = await request(app).post(loginEndPoint).send({
                identifier: testSeller.email,
                password: testSeller.password,
                role: "seller"
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);
    });

    describe(`PUT ${forgotPasswordEndPoint}`, () => {
        test("should send forgot password email for valid seller and return 200", async () => {
            const response = await request(app).put(forgotPasswordEndPoint).send({
                email: testSeller.email,
                role: "seller"
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);
    });
});