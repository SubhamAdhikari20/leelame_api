// src/__tests__/utils/test-utils.ts
import request from 'supertest';
import app from './../../app.ts';
import UserModel from './../../models/user.model.ts';
import BuyerModel from './../../models/buyer.model.ts';
import SellerModel from './../../models/seller.model.ts';
import AdminModel from './../../models/admin.model.ts';


export const api = request(app);

export async function createTestBuyer(overrides: Partial<any> = {}) {
    const email = `buyer-${Date.now()}@test.local`;
    const username = `buyer${Date.now().toString(36)}`;

    const user = await UserModel.create({
        email,
        role: 'buyer',
        isVerified: true,
        ...overrides.user,
    });

    const buyer = await BuyerModel.create({
        baseUserId: user._id,
        fullName: 'Test Buyer',
        username,
        contact: '98' + Math.floor(10000000 + Math.random() * 90000000),
        password: 'Test1234!',
        terms: true,
        bio: 'Test bio',
        ...overrides.buyer,
    });

    return { user, buyer };
}

export async function createTestSeller(overrides: Partial<any> = {}) {
    const email = `seller-${Date.now()}@test.local`;

    const user = await UserModel.create({
        email,
        role: 'seller',
        isVerified: true,
    });

    const seller = await SellerModel.create({
        baseUserId: user._id,
        fullName: 'Test Seller',
        contact: '98' + Math.floor(10000000 + Math.random() * 90000000),
        password: 'Test1234!',
        sellerStatus: 'verified',
        ...overrides.seller,
    });

    return { user, seller };
}

export async function loginAsBuyer(buyerData?: any) {
    const { buyer } = buyerData || (await createTestBuyer());

    const res = await api.post('/api/users/buyer/login').send({
        identifier: buyer.baseUserId.email || (await UserModel.findById(buyer.baseUserId))?.email,
        password: 'Test1234!',
    });

    if (res.status !== 200) throw new Error('Login failed in test helper');

    const token = res.body.token;
    return { token, buyer };
}

export async function loginAsSeller() {
    const { seller } = await createTestSeller();
    const res = await api.post('/api/users/seller/login').send({
        email: (await UserModel.findById(seller.baseUserId))?.email,
        password: 'Test1234!',
    });

    return { token: res.body.token, seller };
}

// ... you can add loginAsAdmin, createTestCategory, createTestProduct, etc.