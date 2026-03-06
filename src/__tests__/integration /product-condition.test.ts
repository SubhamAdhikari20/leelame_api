// src/__tests__/integration/product-condition.test.ts
import request from "supertest";
import app from "./../../app.ts";
import UserModel from "./../../models/user.model.ts";
import ProductConditionModel from "./../../models/product-condition.model.ts";

describe("Product Condition Integration Tests", () => {
    const signUpEndPoint = "/api/users/admin/sign-up";
    const loginEndPoint = "/api/users/admin/login";
    const createConditionEndPoint = "/api/product-condition/create";
    const getAllConditionsEndPoint = "/api/product-condition/all";
    const updateConditionEndPoint = "/api/product-condition/update/:id";
    const deleteConditionEndPoint = "/api/product-condition/delete/:id";

    let adminToken: string;
    let conditionId: string;

    const unique = Date.now().toString(36);
    const testAdmin = {
        fullName: "PC Admin",
        email: `pcadmin${unique}@example.com`,
        contact: `9823${unique.slice(0, 6)}`,
        password: "AdminPass@123",
        confirmPassword: "AdminPass@123",
        role: "admin",
    };

    beforeAll(async () => {
        await cleanupTestData();

        await request(app).post(signUpEndPoint).send(testAdmin);
        const base = await UserModel.findOne({ email: testAdmin.email });
        if (!base) throw new Error("Admin base not created");

        await UserModel.updateOne({ _id: base._id }, { $set: { isVerified: true } });

        const loginResp = await request(app).post(loginEndPoint).send({
            identifier: testAdmin.email,
            password: testAdmin.password,
            role: "admin",
        });
        adminToken = loginResp.body.token;
    }, 30000);


    const cleanupTestData = async () => {
        await ProductConditionModel.deleteMany({ productConditionName: /ProductTestCondition/ });
        await UserModel.deleteMany({ email: testAdmin.email });
    };
    afterAll(cleanupTestData);

    test("should create a new product condition with admin token and return 201", async () => {
        const response = await request(app)
            .post(createConditionEndPoint)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                productConditionName: `ProductTestCondition${unique}`,
                productConditionEnum: "NEW",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.condition.productConditionName).toBe(`ProductTestCondition${unique}`);
        conditionId = response.body.condition._id;
    }, 20000);

    test("should not create duplicate product condition and return 409", async () => {
        const response = await request(app)
            .post(createConditionEndPoint)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                productConditionName: `ProductTestCondition${unique}`,
                productConditionEnum: "NEW",
            });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    }, 20000);

    test("should get all product conditions and return 200", async () => {
        const response = await request(app).get(getAllConditionsEndPoint);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.conditions)).toBe(true);
    }, 20000);

    test("should update product condition with admin token and return 200", async () => {
        const response = await request(app)
            .put(updateConditionEndPoint.replace(":id", conditionId))
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ productConditionEnum: "NEW" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    }, 20000);
});