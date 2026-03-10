// src/__tests__/integration/bid.test.ts
import request from "supertest";
import app from "../../app.ts";
import UserModel from "../../models/user.model.ts";
import BuyerModel from "../../models/buyer.model.ts";
import SellerModel from "../../models/seller.model.ts";
import ProductModel from "../../models/product.model.ts";
import CategoryModel from "../../models/category.model.ts";
import ProductConditionModel from "../../models/product-condition.model.ts";

describe("Bid Integration Tests", () => {
    let buyerToken = "";
    let buyerId = "";
    let productId = "";

    const unique = Date.now().toString(36);

    const testBuyer = {
        fullName: "Bid Test Buyer",
        email: `bidbuyer${unique}@example.com`,
        username: `bidbuyer${unique}`,
        contact: `9864${String(Date.now()).slice(-6)}`,
        password: "Password@123",
        confirmPassword: "Password@123",
        terms: true,
        role: "buyer"
    };

    const testSeller = {
        fullName: "Bid Test Seller",
        email: `bidseller${unique}@example.com`,
        contact: `9876${String(Date.now() + 1).slice(-6)}`,
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "seller"
    };

    beforeAll(async () => {
        await cleanupTestData();

        // 1. Create verified buyer
        await request(app).post("/api/users/buyer/sign-up").send(testBuyer);
        const buyerUser = await UserModel.findOne({ email: testBuyer.email });
        await UserModel.updateOne({ _id: buyerUser?._id.toString() ?? "" }, { $set: { isVerified: true } });
        const buyerProfile = await BuyerModel.findOne({ baseUserId: buyerUser?._id.toString() ?? "" });
        buyerId = buyerProfile?._id.toString() ?? "";

        const buyerLogin = await request(app).post("/api/users/buyer/login").send({
            identifier: testBuyer.email,
            password: testBuyer.password,
            role: "buyer"
        });
        buyerToken = buyerLogin.body.token;

        // 2. Create verified seller + product
        await request(app).post("/api/users/seller/sign-up").send(testSeller);
        const sellerUser = await UserModel.findOne({ email: testSeller.email });
        await UserModel.updateOne({ _id: sellerUser?._id.toString() ?? "" }, { $set: { isVerified: true } });

        const sellerLogin = await request(app).post("/api/users/seller/login").send({
            identifier: testSeller.email,
            password: testSeller.password,
            role: "seller"
        });
        const sellerToken = sellerLogin.body.token;

        // 3. Create supporting data
        const category = await CategoryModel.create({
            categoryName: `BidCat${unique}`,
            categoryStatus: "active"
        });

        const condition = await ProductConditionModel.create({
            productConditionName: `BidCond${unique}`,
            productConditionEnum: "NEW"   // ← FIXED: must be "NEW"
        });

        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const productRes = await request(app)
            .post("/api/product/create-product")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                productName: `BidProduct${unique}`,
                description: "Test product for bid",
                startPrice: 500,
                bidIntervalPrice: 50,
                endDate: futureDate.toISOString(),
                categoryId: category._id.toString(),
                conditionId: condition._id.toString()
            });

        productId = productRes.body.product?._id || productRes.body.data?._id;
    }, 45000);

    const cleanupTestData = async () => {
        await UserModel.deleteMany({ email: { $in: [testBuyer.email, testSeller.email] } });
        await ProductModel.deleteMany({ productName: /BidProduct/ });
        await CategoryModel.deleteMany({ categoryName: /BidCat/ });
        await ProductConditionModel.deleteMany({ productConditionName: /BidCond/ });
    };

    afterAll(cleanupTestData);

    test("should create a new bid with buyer token and return 201", async () => {
        const response = await request(app)
            .post("/api/bid/create-bid")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, buyerId, bidAmount: 600 });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    }, 20000);

    test("should get bids for product and return 200", async () => {
        const response = await request(app).get(`/api/bid/get-all-bids-by-productId/${productId}`);
        expect(response.status).toBe(200);
    }, 20000);
});