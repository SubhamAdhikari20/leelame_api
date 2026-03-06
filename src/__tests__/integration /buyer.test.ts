// src/__tests__/integration/buyer.test.ts
import request from "supertest";
import app from "./../../app.ts";
import UserModel from "../../models/user.model.ts";
import BuyerModel from "../../models/buyer.model.ts";


describe("Buyer Profile Integration Tests", () => {
    const signUpEndPoint = "/api/users/buyer/sign-up";
    const loginEndPoint = "/api/users/buyer/login";
    const updateProfileEndPoint = "/api/users/buyer/update-profile-details/:id";
    const forgotPasswordEndPoint = "/api/users/buyer/forgot-password";
    const resetPasswordEndPoint = "/api/users/buyer/reset-password";

    let token: string;
    let buyerId: string;
    let baseUserId: string;

    const testUser = {
        fullName: "Test User",
        email: "buyerprofile@gmail.com",
        username: "BuyerProfile2020",
        contact: "9864922260",
        password: "Password@123",
        confirmPassword: "Password@123",
        terms: true,
        role: "buyer"
    };

    const updateUserData = {
        fullName: "Updated Buyer Name",
        username: "BuyerProfile2025",
        contact: "9856789123",
        bio: "This is my updated bio from integration test"
    };

    beforeAll(async () => {
        await cleanupTestData();
        const signUpResponse = await request(app).post(signUpEndPoint).send(testUser);
        const baseUser = await UserModel.findOne({ email: testUser.email });
        const existingBuyer = await BuyerModel.findOne({ baseUserId: baseUser?._id.toString() ?? "" });
        baseUserId = baseUser?._id.toString()!;
        buyerId = existingBuyer?._id.toString()!;
        await UserModel.updateOne({ _id: baseUser?._id.toString() ?? ""  }, { $set: { isVerified: true } });
        const loginResponse = await request(app).post(loginEndPoint).send({
            identifier: testUser.email,
            password: testUser.password,
            role: "buyer"
        });
        token = loginResponse.body.token;
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    const cleanupTestData = async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await BuyerModel.deleteMany({ username: testUser.username });
    };

    describe(`PUT ${updateProfileEndPoint}`, () => {
        test("should update buyer profile details and return 200", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", buyerId))
                .set("Authorization", `Bearer ${token}`)
                .send(updateUserData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Buyer profile details updated successfully.");
            expect(response.body.user.fullName).toBe(updateUserData.fullName);
        }, 20000);

        test("should reject update buyer profile when no authorization token is provided", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", buyerId))
                .send(updateUserData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        test("should reject update buyer profile with invalid buyer id and return 400", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", "invalidid123"))
                .set("Authorization", `Bearer ${token}`)
                .send(updateUserData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        test("should reject update when fullName is empty and return 400", async () => {
            const response = await request(app)
                .put(updateProfileEndPoint.replace(":id", buyerId))
                .set("Authorization", `Bearer ${token}`)
                .send({ ...updateUserData, fullName: "" });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);
    });

    describe(`POST ${loginEndPoint}`, () => {
        test("should login verified buyer with email and return 200", async () => {
            const response = await request(app).post(loginEndPoint).send({
                identifier: testUser.email,
                password: testUser.password,
                role: "buyer"
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("token");
        }, 20000);

        test("should login verified buyer with username and return 200", async () => {
            const response = await request(app).post(loginEndPoint).send({
                identifier: updateUserData.username,
                password: testUser.password,
                role: "buyer"
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("token");
        }, 20000);

        test("should not login buyer with wrong password and return 400", async () => {
            const response = await request(app).post(loginEndPoint).send({
                identifier: testUser.email,
                password: "WrongPassword@123",
                role: "buyer"
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        test("should not login buyer with non-existent email and return 404", async () => {
            const response = await request(app).post(loginEndPoint).send({
                identifier: "nonexistent@gmail.com",
                password: testUser.password,
                role: "buyer"
            });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        }, 20000);
    });

    describe(`POST ${forgotPasswordEndPoint}`, () => {
        test("should send forgot password email for valid buyer and return 200", async () => {
            const response = await request(app).post(forgotPasswordEndPoint).send({
                email: testUser.email,
                role: "buyer"
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 20000);

        test("should return 404 for non-existent email in forgot password", async () => {
            const response = await request(app).post(forgotPasswordEndPoint).send({
                email: "nobody@gmail.com",
                role: "buyer"
            });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        }, 20000);
    });
});


// // src/__test__/integration/buyer.test.ts
// import request from "supertest";
// import app from "./../../app.ts";
// import UserModel from "./../../models/user.model.ts";
// import BuyerModel from "./../../models/buyer.model.ts";
// import path from "path/win32";


// describe(
//     "Buyer Profile Integration Tests",
//     () => {
//         const signUpEndPoint = "/api/users/buyer/sign-up";
//         const loginEndPoint = "/api/users/buyer/login";
//         const updateProfileEndPoint = "/api/users/buyer/update-profile-details/:id";
//         const forgotPasswordEndPoint = "/api/users/buyer/forgot-password";
//         const resetPasswordEndPoint = "/api/users/buyer/reset-password";
//         // const uploadProfilePictureEndPoint = "/api/users/buyer/upload-profile-picture/:id";

//         let token: string;
//         let buyerId: string;
//         let baseUserId: string;

//         // const unique = Date.now() + Math.random().toString(36).slice(2, 8);
//         const testUser = {
//             fullName: "Test User",
//             email: "buyer@gmail.com",
//             // email: `test+${unique}@example.com`,
//             // username: `Testuser20`,
//             // contact: "9864922251",
//             username: "Buyer2020",
//             contact: "9864922260",
//             password: "Password@123",
//             confirmPassword: "Password@123",
//             terms: true,
//             role: "buyer"
//         };

//         const updateUserData = {
//             fullName: "Updated Buyer Name",
//             username: "Buyer2025",
//             contact: "9856789123",
//             bio: "This is my updated bio from integration test",
//         };

//         beforeAll(async () => {
//             await cleanupTestData();

//             const signUpResponse = await request(app).post(signUpEndPoint).send(testUser);

//             const baseUser = await UserModel.findOne({ email: testUser.email });
//             if (!baseUser) {
//                 throw new Error("Base user not created");
//             }

//             const existingBuyer = await BuyerModel.findOne({ baseUserId: baseUser._id.toString() });
//             if (!existingBuyer) {
//                 throw new Error("Buyer profile not created");
//             }

//             baseUserId = baseUser._id.toString();
//             buyerId = existingBuyer._id.toString();

//             await UserModel.updateOne(
//                 { _id: baseUser._id.toString() },
//                 { $set: { isVerified: true } }
//             );

//             // Login to get JWT token
//             const loginResponse = await request(app).post(loginEndPoint).send({
//                 identifier: testUser.email,
//                 password: testUser.password,
//                 role: "buyer"
//             });

//             token = loginResponse.body.token;
//         });

//         afterAll(async () => {
//             await cleanupTestData();
//         });

//         const cleanupTestData = async () => {
//             await UserModel.deleteMany({ email: testUser.email });
//             await BuyerModel.deleteMany({ username: testUser.username });
//         };

//         describe(
//             `POST ${updateProfileEndPoint}`,
//             () => {
//                 test(
//                     "should update buyer profile details and return 200",
//                     async () => {
//                         // const updateUserData = {
//                         //     fullName: "Updated Buyer Name",
//                         //     username: "Buyer2025",
//                         //     contact: "9856789123",
//                         //     bio: "This is my updated bio from integration test",
//                         // };

//                         const response = await request(app)
//                             .put(updateProfileEndPoint.replace(":id", buyerId))
//                             .set("Authorization", `Bearer ${token}`)
//                             .send(updateUserData);

//                         console.log("Ok: ", response.body);
//                         console.log("Buyer Id:  ", buyerId);

//                         expect(response.status).toBe(200);
//                         expect(response.body).toHaveProperty("success", true);
//                         expect(response.body).toHaveProperty("message", "Buyer profile details updated successfully.");
//                         expect(response.body.user).toMatchObject({
//                             fullName: updateUserData.fullName,
//                             username: updateUserData.username,
//                             contact: updateUserData.contact,
//                             bio: updateUserData.bio,
//                             email: testUser.email,
//                             role: 'buyer',
//                         });
//                     },
//                     20000
//                 );

//                 test(
//                     "should reject update buyer profile when no authorization token is provided",
//                     async () => {
//                         const response = await request(app)
//                             .put(updateProfileEndPoint.replace(":id", buyerId))
//                             .send(updateUserData);

//                         expect(response.status).toBe(400);
//                         expect(response.body).toHaveProperty("success", false);
//                         expect(response.body).toHaveProperty("message", "Token Error! Token buyer id not found.");
//                     },
//                     50000
//                 );

//                 test("should reject update buyer profile with invalid buyer id and return 400", async () => {
//                     const response = await request(app)
//                         .put(updateProfileEndPoint.replace(":id", "invalidid123"))
//                         .set("Authorization", `Bearer ${token}`)
//                         .send(updateUserData);

//                     expect(response.status).toBe(400);
//                     expect(response.body).toHaveProperty("success", false);
//                 }, 20000);

//                 test("should reject update when fullName is empty and return 400", async () => {
//                     const response = await request(app)
//                         .put(updateProfileEndPoint.replace(":id", buyerId))
//                         .set("Authorization", `Bearer ${token}`)
//                         .send({ ...updateUserData, fullName: "" });

//                     expect(response.status).toBe(400);
//                     expect(response.body).toHaveProperty("success", false);
//                 }, 20000);

//                 // test(
//                 //     "should upload profile picture and return 200",
//                 //     async () => {
//                 //         const response = await request(app)
//                 //             .put(uploadProfilePictureEndPoint.replace(":id", buyerId))
//                 //             .set("Authorization", `Bearer ${token}`)
//                 //             .attach("profilePicture", path.join(__dirname, "./../uploads/images/profile-picture/buyer/test-image.jpg"));

//                 //         expect(response.status).toBe(200);
//                 //         expect(response.body).toHaveProperty("success", true);
//                 //         expect(response.body).toHaveProperty("message", "Buyer profile picture uploaded successfully.");
//                 //     },
//                 //     20000
//                 // );

//                 // test(
//                 //     "should not upload profile picture without token and return 400",
//                 //     async () => {
//                 //         const response = await request(app)
//                 //             .put(uploadProfilePictureEndPoint.replace(":id", buyerId))
//                 //             .set("Authorization", `Bearer ${token}`)
//                 //             .attach("profilePicture", path.join(__dirname, "./../uploads/images/profile-picture/buyer/test-image.jpg"));

//                 //         expect(response.status).toBe(400);
//                 //         expect(response.body).toHaveProperty("success", false);
//                 //         expect(response.body).toHaveProperty("message", "Token Error! Token buyer id not found.");
//                 //     },
//                 //     50000
//                 // );
//             }
//         );

//          describe(`POST ${loginEndPoint}`, () => {
//         test("should login verified buyer with email and return 200", async () => {
//             const response = await request(app).post(loginEndPoint).send({
//                 identifier: testUser.email,
//                 password: testUser.password,
//                 role: "buyer",
//             });

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty("success", true);
//             expect(response.body).toHaveProperty("token");
//         }, 20000);

//         test("should login verified buyer with username and return 200", async () => {
//             const response = await request(app).post(loginEndPoint).send({
//                 identifier: updateUserData.username,
//                 password: testUser.password,
//                 role: "buyer",
//             });

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty("success", true);
//             expect(response.body).toHaveProperty("token");
//         }, 20000);

//         test("should not login buyer with wrong password and return 400", async () => {
//             const response = await request(app).post(loginEndPoint).send({
//                 identifier: testUser.email,
//                 password: "WrongPassword@123",
//                 role: "buyer",
//             });

//             expect(response.status).toBe(400);
//             expect(response.body).toHaveProperty("success", false);
//         }, 20000);

//         test("should not login buyer with non-existent email and return 404", async () => {
//             const response = await request(app).post(loginEndPoint).send({
//                 identifier: "nonexistent@gmail.com",
//                 password: testUser.password,
//                 role: "buyer",
//             });

//             expect(response.status).toBe(404);
//             expect(response.body).toHaveProperty("success", false);
//         }, 20000);
//     });

//     describe(`POST ${forgotPasswordEndPoint}`, () => {
//         test("should send forgot password email for valid buyer and return 200", async () => {
//             const response = await request(app).post(forgotPasswordEndPoint).send({
//                 email: testUser.email,
//                 role: "buyer",
//             });

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty("success", true);
//         }, 20000);

//         test("should return 404 for non-existent email in forgot password", async () => {
//             const response = await request(app).post(forgotPasswordEndPoint).send({
//                 email: "nobody@gmail.com",
//                 role: "buyer",
//             });

//             expect(response.status).toBe(404);
//             expect(response.body).toHaveProperty("success", false);
//         }, 20000);
//     });
//     }
// );