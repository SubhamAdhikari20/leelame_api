// // src/__tests__/setup.ts
// import connectDB from "./../config/db.ts";
// import mongoose from "mongoose";

// // before all test starts
// beforeAll(async () => {
//     // can connect to test database or other test engines
//     await connectDB();
// });

// // after all tests are done
// afterAll(async () => {
//     await mongoose.connection.close();
// });



import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;


beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
        instance: {
            port: 0, // random free port
            dbName: 'leelame-test',
        },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    });
}, 45000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) {
        await mongod.stop();
    }
}, 15000);

// // beforeAll(async () => {
// //     mongod = await MongoMemoryServer.create();
// //     const uri = mongod.getUri();
// //     await mongoose.connect(uri);
// // }, 30000);
// // afterAll(async () => {
// //     await mongoose.disconnect();
// //     await mongod.stop();
// // }, 10000);
// // afterEach(async () => {
// //   const collections = mongoose.connection.collections;
// //   for (const key in collections) {
// //     await collections[key]?.deleteMany({});
// //   }
// // }, 10000);