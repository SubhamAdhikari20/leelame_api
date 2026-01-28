// src/repositories/seller.repository.ts
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { Seller, SellerDocument } from "./../types/seller.type.ts";
import UserModel from "./../models/user.model.ts";
import SellerModel from "./../models/seller.model.ts";


export class SellerRepository implements SellerRepositoryInterface {
    createSeller = async (seller: Partial<Seller>): Promise<SellerDocument | null> => {
        const newSeller = await SellerModel.create(seller);
        return newSeller;
    };

    updateSeller = async (id: string, seller: Partial<Seller>): Promise<SellerDocument | null> => {
        const updatedSeller = await SellerModel.findByIdAndUpdate(id, seller, { new: true }).lean();
        return updatedSeller;
    };

    deleteSeller = async (id: string): Promise<Boolean> => {
        const seller = await this.findSellerById(id);
        if (!seller) {
            return false;
        }
        
        await SellerModel.findByIdAndDelete(id);
        await UserModel.findByIdAndDelete(seller.baseUserId.toString());

        const deletedSeller = await this.findSellerById(id);
        const deletedBaseUser = await UserModel.findById(seller.baseUserId.toString()).lean();

        if (deletedSeller || deletedBaseUser) {
            return false;
        }
        return true;
    };

    findSellerById = async (id: string): Promise<SellerDocument | null> => {
        const seller = await SellerModel.findById(id).lean();
        return seller;
    };

    findSellerByBaseUserId = async (baseUserId: string): Promise<SellerDocument | null> => {
        const seller = await SellerModel.findOne({ baseUserId: baseUserId }).lean();
        return seller;
    };

    findSellerByEmail = async (email: string): Promise<SellerDocument | null> => {
        const baseUser = await UserModel.findOne({ email }).lean();
        if (!baseUser) {
            return null;
        }
        const seller = await this.findSellerByBaseUserId(baseUser._id.toString());
        return seller;
    };

    findSellerByContact = async (contact: string): Promise<SellerDocument | null> => {
        const seller = await SellerModel.findOne({ contact }).lean();
        return seller;
    };

    getAllSellers = async (): Promise<SellerDocument[] | null> => {
        const sellers = await SellerModel.find().lean();
        return sellers;
    };
}