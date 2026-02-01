// src/repositories/seller.repository.ts
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { Seller, SellerDocument } from "./../types/seller.type.ts";
import type { ClientSession } from "mongoose";
import UserModel from "./../models/user.model.ts";
import SellerModel from "./../models/seller.model.ts";


export class SellerRepository implements SellerRepositoryInterface {
    createSeller = async (seller: Partial<Seller>, options?: { session?: ClientSession | null }): Promise<SellerDocument | null> => {
        const session = options?.session ?? null;
        const newSeller = await new SellerModel(seller).save({ session });
        return newSeller;
    };

    updateSeller = async (id: string, seller: Partial<Seller>, options?: { session?: ClientSession | null }): Promise<SellerDocument | null> => {
        const session = options?.session ?? null;
        let query = SellerModel.findByIdAndUpdate(id, seller, { new: true });
        if (session) {
            query = query.session(session);
        }
        const updatedSeller = await query.lean();
        return updatedSeller;
    };

    deleteSeller = async (id: string, options?: { session?: ClientSession | null }): Promise<Boolean> => {
        const session = options?.session ?? null;
        const seller = await this.findSellerById(id);
        if (!seller) {
            return false;
        }

        let deleteSellerQuery = SellerModel.findByIdAndDelete(id);
        if (session) {
            deleteSellerQuery = deleteSellerQuery.session(session);
        }
        await deleteSellerQuery.exec();

        let deleteUserQuery = UserModel.findByIdAndDelete(seller.baseUserId.toString());
        if (session) {
            deleteUserQuery = deleteUserQuery.session(session);
        }
        await deleteUserQuery.exec();

        const deletedSeller = await this.findSellerById(id, { session });

        let deletedBaseUserQuery = UserModel.findById(seller.baseUserId.toString());
        if (session) {
            deletedBaseUserQuery = deletedBaseUserQuery.session(session);
        }
        const deletedBaseUser = await deletedBaseUserQuery.lean();

        if (deletedSeller || deletedBaseUser) {
            return false;
        }
        return true;
    };

    findSellerById = async (id: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null> => {
        const session = options?.session ?? null;
        let query = SellerModel.findById(id);
        if (session) {
            query = query.session(session);
        }
        const seller = await query.lean();
        return seller;
    };

    findSellerByBaseUserId = async (baseUserId: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null> => {
        const session = options?.session ?? null;
        let query = SellerModel.findOne({ baseUserId: baseUserId });
        if (session) {
            query = query.session(session);
        }
        const seller = await query.lean();
        return seller;
    };

    findSellerByEmail = async (email: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null> => {
        const session = options?.session ?? null;
        let query = UserModel.findOne({ email });
        if (session) {
            query = query.session(session);
        }
        const baseUser = await query.lean();
        if (!baseUser) {
            return null;
        }
        const seller = await this.findSellerByBaseUserId(baseUser._id.toString());
        return seller;
    };

    findSellerByContact = async (contact: string, options?: { session?: ClientSession | null }): Promise<SellerDocument | null> => {
        const session = options?.session ?? null;
        let query = SellerModel.findOne({ contact });
        if (session) {
            query = query.session(session);
        }
        const seller = await query.lean();
        return seller;
    };

    getAllSellers = async (options?: { session?: ClientSession | null }): Promise<SellerDocument[] | null> => {
        const session = options?.session ?? null;
        let query = SellerModel.find();
        if (session) {
            query = query.session(session);
        }
        const sellers = await query.lean();
        return sellers;
    };
}