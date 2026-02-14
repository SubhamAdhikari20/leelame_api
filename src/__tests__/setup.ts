// src/__tests__/setup.ts
import connectDB from "./../config/db.ts";
import mongoose from "mongoose";

// before all test starts
beforeAll(async () => {
    // can connect to test database or other test engines
    await connectDB();
});

// after all tests are done
afterAll(async () => {
    await mongoose.connection.close();
});