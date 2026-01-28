// src/repositories/buyer.repository.ts
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { Buyer, BuyerDocument, ProviderBuyer } from "./../types/buyer.type.ts";
import BuyerModel from "./../models/buyer.model.ts";
import UserModel from "./../models/user.model.ts";


export class BuyerRepository implements BuyerRepositoryInterface {
    createBuyer = async (buyer: Buyer): Promise<BuyerDocument | null> => {
        const newBuyer = await BuyerModel.create(buyer);
        return newBuyer;
    };

    updateBuyer = async (id: string, buyer: Partial<Buyer>): Promise<BuyerDocument | null> => {
        const updatedBuyer = await BuyerModel.findByIdAndUpdate(id, buyer, { new: true }).lean();
        return updatedBuyer;
    };

    deleteBuyer = async (id: string): Promise<Boolean> => {
        const buyer = await this.findBuyerById(id);
        if (!buyer) {
            return false;
        }
        
        await BuyerModel.findByIdAndDelete(id);
        await UserModel.findByIdAndDelete(buyer.baseUserId.toString());

        const deletedBuyer = await this.findBuyerById(id);
        const deletedBaseUser = await UserModel.findById(buyer.baseUserId.toString()).lean();

        if (deletedBuyer || deletedBaseUser) {
            return false;
        }
        return true;
    };

    findBuyerById = async (id: string): Promise<BuyerDocument | null> => {
        const buyer = await BuyerModel.findById(id).lean();
        // const buyer = await BuyerModel.findOne({ _id: id }).lean();
        return buyer;
    };

    findBuyerByBaseUserId = async (baseUserId: string): Promise<BuyerDocument | null> => {
        const buyer = await BuyerModel.findOne({ baseUserId: baseUserId }).lean();
        // const buyer = await BuyerModel.findOne({ userId: new Schema.Types.ObjectId(userId) }).lean();
        return buyer;
    };

    findBuyerByEmail = async (email: string): Promise<BuyerDocument | null> => {
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
            return null;
        }
        const buyer = await this.findBuyerByBaseUserId(user._id.toString());
        return buyer;
    }

    findBuyerByUsername = async (username: string): Promise<BuyerDocument | null> => {
        const buyer = await BuyerModel.findOne({ username }).lean();
        return buyer;
    };

    findBuyerByContact = async (contact: string): Promise<BuyerDocument | null> => {
        const buyer = await BuyerModel.findOne({ contact }).lean();
        return buyer;
    };

    getAllBuyers = async (): Promise<BuyerDocument[] | null> => {
        const buyers = await BuyerModel.find().lean();
        return buyers;
    };

    createGoogleProviderBuyer = async (buyer: ProviderBuyer): Promise<BuyerDocument | null> => {
        const newBuyer = await BuyerModel.create(buyer);
        return newBuyer;
    }
}