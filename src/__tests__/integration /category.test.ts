import request from "supertest";
import app from "./../../app.ts";
import UserModel from "./../../models/user.model.ts";
import AdminModel from "./../../models/admin.model.ts";
import CategoryModel from "./../../models/category.model.ts";

describe("Category Integration Tests", () => {
    const signUpEndPoint = "/api/users/admin/sign-up";
    const loginEndPoint = "/api/users/admin/login";
    const createCategoryEndPoint = "/api/category/create";
    const getAllCategoriesEndPoint = "/api/category/all";
    const getCategoryByIdEndPoint = "/api/category/:id";
    const updateCategoryEndPoint = "/api/category/update/:id";
    const deleteCategoryEndPoint = "/api/category/delete/:id";

    let adminToken: string;
    let categoryId: string;

    const testAdmin = {
        fullName: "Category Admin",
        email: "categoryadmin@gmail.com",
        contact: "9822000021",
        password: "AdminPass@123",
        confirmPassword: "AdminPass@123",
        role: "admin",
    };

    const testCategory = {
        categoryName: "TestCategory001",
        description: "Test category description",
        categoryStatus: "active",
    };

    const cleanupTestData = async () => {
        const user = await UserModel.findOne({ email: testAdmin.email });
        if (user) {
            await AdminModel.deleteMany({ baseUserId: user._id.toString() });
        }
        await UserModel.deleteMany({ email: testAdmin.email });
        await CategoryModel.deleteMany({ categoryName: testCategory.categoryName });
    };

    beforeAll(async () => {
        await cleanupTestData();

        await request(app).post(signUpEndPoint).send(testAdmin);

        const baseUser = await UserModel.findOne({ email: testAdmin.email });
        if (!baseUser) throw new Error("Admin base user not created");

        await UserModel.updateOne(
            { _id: baseUser._id },
            { $set: { isVerified: true } }
        );

        const loginResponse = await request(app).post(loginEndPoint).send({
            identifier: testAdmin.email,
            password: testAdmin.password,
            role: "admin",
        });

        adminToken = loginResponse.body.token;
    }, 30000);

    afterAll(async () => {
        await cleanupTestData();
    }, 30000);

    describe(`POST ${createCategoryEndPoint}`, () => {
        test("should create a new category with admin token and return 201", async () => {
            const response = await request(app)
                .post(createCategoryEndPoint)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(testCategory);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.category).toHaveProperty(
                "categoryName",
                testCategory.categoryName
            );

            categoryId = response.body.category._id;
        }, 20000);

        test("should not create duplicate category name and return 409", async () => {
            const response = await request(app)
                .post(createCategoryEndPoint)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(testCategory);

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);

        test("should not create category without categoryName and return 400", async () => {
            const response = await request(app)
                .post(createCategoryEndPoint)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ description: "No name", categoryStatus: "active" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);

        test("should not create category with invalid categoryStatus and return 400", async () => {
            const response = await request(app)
                .post(createCategoryEndPoint)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryName: "BadStatusCat", categoryStatus: "unknown" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);

        test("should not create category without admin token and return 401", async () => {
            const response = await request(app)
                .post(createCategoryEndPoint)
                .send({ categoryName: "UnauthorizedCat", categoryStatus: "active" });

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);
    });

    describe(`GET ${getAllCategoriesEndPoint}`, () => {
        test("should get all categories and return 200", async () => {
            const response = await request(app).get(getAllCategoriesEndPoint);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(Array.isArray(response.body.categories)).toBe(true);
        }, 20000);
    });

    describe(`GET ${getCategoryByIdEndPoint}`, () => {
        test("should get category by valid id and return 200", async () => {
            const response = await request(app).get(
                getCategoryByIdEndPoint.replace(":id", categoryId)
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.category).toHaveProperty("_id", categoryId);
        }, 20000);

        test("should return 400 or 404 for invalid category id", async () => {
            const response = await request(app).get(
                getCategoryByIdEndPoint.replace(":id", "invalidid123")
            );

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);

        test("should return 404 for non-existent category id", async () => {
            const response = await request(app).get(
                getCategoryByIdEndPoint.replace(":id", "000000000000000000000000")
            );

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);
    });

    describe(`PUT ${updateCategoryEndPoint}`, () => {
        test("should update category with admin token and return 200", async () => {
            const response = await request(app)
                .put(updateCategoryEndPoint.replace(":id", categoryId))
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryStatus: "inactive" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        }, 20000);

        test("should not update category without admin token and return 401", async () => {
            const response = await request(app)
                .put(updateCategoryEndPoint.replace(":id", categoryId))
                .send({ categoryStatus: "inactive" });

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);

        test("should return 400 for invalid category id on update", async () => {
            const response = await request(app)
                .put(updateCategoryEndPoint.replace(":id", "invalidid123"))
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryStatus: "active" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);
    });

    describe(`DELETE ${deleteCategoryEndPoint}`, () => {
        test("should not delete category without admin token and return 401", async () => {
            const response = await request(app).delete(
                deleteCategoryEndPoint.replace(":id", categoryId)
            );

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);

        test("should delete category with admin token and return 200", async () => {
            const response = await request(app)
                .delete(deleteCategoryEndPoint.replace(":id", categoryId))
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        }, 20000);

        test("should return 404 when deleting already deleted category", async () => {
            const response = await request(app)
                .delete(deleteCategoryEndPoint.replace(":id", categoryId))
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
        }, 20000);
    });
});