// src/repositories/buyer.repository.ts
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { Buyer, BuyerDocument, ProviderBuyer } from "./../types/buyer.type.ts";
import type { ClientSession } from "mongoose";
import BuyerModel from "./../models/buyer.model.ts";
import UserModel from "./../models/user.model.ts";


export class BuyerRepository implements BuyerRepositoryInterface {
    createBuyer = async (buyer: Buyer, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        const newBuyer = await new BuyerModel(buyer).save({ session });
        return newBuyer;
    };

    updateBuyer = async (id: string, buyer: Partial<Buyer>, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        let query = BuyerModel.findByIdAndUpdate(id, buyer, { new: true });
        if (session) {
            query = query.session(session);
        }
        const updatedBuyer = await query.lean();
        return updatedBuyer;
    };

    deleteBuyer = async (id: string, options?: { session?: ClientSession | null }): Promise<Boolean> => {
        const session = options?.session ?? null;
        const buyer = await this.findBuyerById(id);
        if (!buyer) {
            return false;
        }

        let deleteBuyerQuery = BuyerModel.findByIdAndDelete(id);
        if (session) {
            deleteBuyerQuery = deleteBuyerQuery.session(session);
        }
        await deleteBuyerQuery.exec();

        let deleteUserQuery = UserModel.findByIdAndDelete(buyer.baseUserId.toString());
        if (session) {
            deleteUserQuery = deleteUserQuery.session(session);
        }
        await deleteUserQuery.exec();

        const deletedBuyer = await this.findBuyerById(id, { session });

        let deletedBaseUserQuery = UserModel.findById(buyer.baseUserId.toString());
        if (session) {
            deletedBaseUserQuery = deletedBaseUserQuery.session(session);
        }
        const deletedBaseUser = await deletedBaseUserQuery.lean();

        if (deletedBuyer || deletedBaseUser) {
            return false;
        }
        return true;
    };

    findBuyerById = async (id: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        let query = BuyerModel.findById(id);
        if (session) {
            query = query.session(session);
        }
        const buyer = await query.lean();
        return buyer;
    };

    findBuyerByBaseUserId = async (baseUserId: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        let query = BuyerModel.findOne({ baseUserId: baseUserId });
        if (session) {
            query = query.session(session);
        }
        const buyer = await query.lean();
        return buyer;
    };

    findBuyerByEmail = async (email: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findOne({ email });
        if (session) {
            query = query.session(session);
        }
        const baseUser = await query.lean();
        if (!baseUser) {
            return null;
        }
        const buyer = await this.findBuyerByBaseUserId(baseUser._id.toString());
        return buyer;
    }

    findBuyerByUsername = async (username: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        let query = BuyerModel.findOne({ username });
        if (session) {
            query = query.session(session);
        }
        const buyer = await query.lean();
        return buyer;
    };

    findBuyerByContact = async (contact: string, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        let query = BuyerModel.findOne({ contact });
        if (session) {
            query = query.session(session);
        }
        const buyer = await query.lean();
        return buyer;
    };

    getAllBuyers = async (options?: { session?: ClientSession | null }): Promise<BuyerDocument[] | null> => {
        const session = options?.session ?? null;
        let query = BuyerModel.find();
        if (session) {
            query = query.session(session);
        }
        const buyers = await query.lean();
        return buyers;
    };

    createGoogleProviderBuyer = async (buyer: ProviderBuyer, options?: { session?: ClientSession | null }): Promise<BuyerDocument | null> => {
        const session = options?.session ?? null;
        const newBuyer = await new BuyerModel(buyer).save({ session });
        return newBuyer;
    };
}