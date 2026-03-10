import request from "supertest";
import app from "./../../app.ts";
import UserModel from "./../../models/user.model.ts";
import SellerModel from "./../../models/seller.model.ts";
import BuyerModel from "./../../models/buyer.model.ts";
import ProductModel from "./../../models/product.model.ts";
import CategoryModel from "./../../models/category.model.ts";
import ProductConditionModel from "./../../models/product-condition.model.ts";
import BidModel from "./../../models/bid.model.ts";


describe("Bid Integration Tests", () => {
    const sellerSignUpEndPoint = "/api/users/seller/sign-up";
    const buyerSignUpEndPoint = "/api/users/buyer/sign-up";
    const sellerLoginEndPoint = "/api/users/seller/login";
    const buyerLoginEndPoint = "/api/users/buyer/login";
    const createProductEndPoint = "/api/product/create-product";
    const createBidEndPoint = "/api/bid/create-bid";
    const getBidsByProductEndPoint = "/api/bid/get-all-bids-by-productId/:productId";
    const getBidByIdEndPoint = "/api/bid/:id";
    const deleteBidEndPoint = "/api/bid/delete-bid/:id";

    let sellerToken: string;
    let buyerToken: string;
    let sellerId: string;
    let buyerId: string;
    let productId: string;
    let categoryId: string;
    let conditionId: string;
    let bidId: string;

    const testSeller = {
        fullName: "Bid Seller",
        email: "bidseller@gmail.com",
        contact: "9812000001",
        password: "Password@123",
        confirmPassword: "Password@123",
        terms: true,
        role: "seller",
    };

    const testBuyer = {
        fullName: "Bid Buyer",
        email: "bidbuyer@gmail.com",
        username: "BidBuyer1",
        contact: "9812000002",
        password: "Password@123",
        confirmPassword: "Password@123",
        terms: true,
        role: "buyer",
    };

    beforeAll(async () => {
        // cleanup
        await UserModel.deleteMany({ email: { $in: [testSeller.email, testBuyer.email] } });

        // create seller and buyer
        await request(app).post(sellerSignUpEndPoint).send(testSeller);
        await request(app).post(buyerSignUpEndPoint).send(testBuyer);

        const sellerBase = await UserModel.findOne({ email: testSeller.email });
        const buyerBase = await UserModel.findOne({ email: testBuyer.email });

        if (!sellerBase || !buyerBase) throw new Error("Base users not created in bid tests");

        // mark verified
        await UserModel.updateOne({ _id: sellerBase._id }, { $set: { isVerified: true } });
        await UserModel.updateOne({ _id: buyerBase._id }, { $set: { isVerified: true } });

        const existingSeller = await SellerModel.findOne({ baseUserId: sellerBase._id.toString() });
        const existingBuyer = await BuyerModel.findOne({ baseUserId: buyerBase._id.toString() });
        if (!existingSeller || !existingBuyer) throw new Error("Seller/Buyer profiles not created");

        sellerId = existingSeller._id.toString();
        buyerId = existingBuyer._id.toString();

        const sellerLogin = await request(app).post(sellerLoginEndPoint).send({
            identifier: testSeller.email,
            password: testSeller.password,
            role: "seller",
        });
        sellerToken = sellerLogin.body.token;

        const buyerLogin = await request(app).post(buyerLoginEndPoint).send({
            identifier: testBuyer.email,
            password: testBuyer.password,
            role: "buyer",
        });
        buyerToken = buyerLogin.body.token;

        // create category and condition and product
        const category = await CategoryModel.create({ categoryName: "BidTestCategory", categoryStatus: "active" });
        categoryId = category._id.toString();

        const condition = await ProductConditionModel.create({ productConditionName: "BidTestCondition", productConditionEnum: "USED_GOOD" });
        conditionId = condition._id.toString();

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const productResponse = await request(app)
            .post(createProductEndPoint)
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                productName: "Bid Test Product",
                description: "Product for bid tests",
                startPrice: 100,
                bidIntervalPrice: 10,
                endDate: futureDate.toISOString(),
                categoryId,
                conditionId,
            });

        productId = productResponse.body.data._id;
    }, 30000);

    afterAll(async () => {
        await BidModel.deleteMany({});
        await ProductModel.deleteMany({ productName: "Bid Test Product" });
        await ProductConditionModel.deleteMany({ productConditionName: "BidTestCondition" });
        await CategoryModel.deleteMany({ categoryName: "BidTestCategory" });
        await SellerModel.deleteMany({ contact: testSeller.contact });
        await BuyerModel.deleteMany({ contact: testBuyer.contact });
        await UserModel.deleteMany({ email: { $in: [testSeller.email, testBuyer.email] } });
    }, 30000);

    test("should create a bid for a product and return 201", async () => {
        const response = await request(app)
            .post(createBidEndPoint)
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({
                productId,
                buyerId,
                bidAmount: 150,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body.data).toHaveProperty("bidAmount", 150);

        bidId = response.body.data._id;
    }, 20000);

    test("should not create bid lower than current price and return error", async () => {
        const response = await request(app)
            .post(createBidEndPoint)
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({
                productId,
                buyerId,
                bidAmount: 120, // lower than latest 150
            });

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty("success", false);
    }, 20000);

    test("should get all bids for product and return 200", async () => {
        const response = await request(app).get(getBidsByProductEndPoint.replace(":productId", productId));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    }, 20000);

    test("should get bid by valid id and return 200", async () => {
        const response = await request(app)
            .get(getBidByIdEndPoint.replace(":id", bidId))
            .set("Authorization", `Bearer ${buyerToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body.data).toHaveProperty("_id", bidId);
    }, 20000);

    test("should reject create bid without token and return 400/401", async () => {
        const response = await request(app).post(createBidEndPoint).send({
            productId,
            buyerId,
            bidAmount: 200,
        });
        expect(response.status).toBeGreaterThanOrEqual(400);
    }, 20000);

    test("should delete bid with buyer token and return 200", async () => {
        const response = await request(app)
            .delete(deleteBidEndPoint.replace(":id", bidId))
            .set("Authorization", `Bearer ${buyerToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
    }, 20000);

    test("should return 404 for already deleted bid", async () => {
        const response = await request(app)
            .delete(deleteBidEndPoint.replace(":id", bidId))
            .set("Authorization", `Bearer ${buyerToken}`);

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty("success", false);
    }, 20000);
});