// src/__tests__/integration/admin.test.ts
import request from "supertest";
import app from "./../../app.ts";
import UserModel from "./../../models/user.model.ts";
import AdminModel from "./../../models/admin.model.ts";

describe("Admin Profile Integration Tests", () => {
    const signUpEndPoint = "/api/users/admin/sign-up";
    const loginEndPoint = "/api/users/admin/login";
    const updateProfileEndPoint = "/api/users/admin/update-profile-details/:id";

    let token: string;
    let adminId: string;

    const testAdmin = {
        fullName: "Test Admin Profile",
        email: "adminprofile@gmail.com",
        contact: "9864922241",
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "admin"
    };

    const updateAdminData = {
        fullName: "Updated Admin Name",
        contact: "9856789125"
    };

    beforeAll(async () => {
        await cleanupTestData();
        await request(app).post(signUpEndPoint).send(testAdmin);
        const baseUser = await UserModel.findOne({ email: testAdmin.email });
        const existingAdmin = await AdminModel.findOne({ baseUserId: baseUser?._id.toString() ?? "" });
        adminId = existingAdmin?._id.toString()!;
        await UserModel.updateOne({ _id: baseUser?._id.toString() ?? "" }, { $set: { isVerified: true } });
        const loginResponse = await request(app).post(loginEndPoint).send({
            identifier: testAdmin.email,
            password: testAdmin.password,
            role: "admin"
        });
        token = loginResponse.body.token;
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    const cleanupTestData = async () => {
        await UserModel.deleteMany({ email: testAdmin.email });
        await AdminModel.deleteMany({ contact: testAdmin.contact });
    };

    describe(`PUT ${updateProfileEndPoint}`, () => {
        test("should update admin profile details and return 200", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", adminId))
                .set("Authorization", `Bearer ${token}`)
                .send(updateAdminData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);

        test("should reject update without token and return 400", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", adminId))
                .send(updateAdminData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);
    });

    describe(`POST ${loginEndPoint}`, () => {
        test("should login verified admin and return 200", async () => {
            const response = await request(app).post(loginEndPoint).send({
                identifier: testAdmin.email,
                password: testAdmin.password,
                role: "admin"
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);
    });
});