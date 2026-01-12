// src/repositories/buyer.repository.ts
import { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import { Buyer, BuyerDocument, ProviderBuyer } from "./../types/buyer.type.ts";
import BuyerModel from "./../models/buyer.model.ts";


export class BuyerRepository implements BuyerRepositoryInterface {
    createBuyer = async (buyer: Buyer): Promise<BuyerDocument | null> => {
        const newBuyer = await BuyerModel.create(buyer);
        return newBuyer;
    };

    updateBuyer = async (id: string, buyer: Partial<Buyer>): Promise<BuyerDocument | null> => {
        const updatedBuyer = await BuyerModel.findByIdAndUpdate(id, buyer, { new: true }).lean();
        return updatedBuyer;
    };

    deleteBuyer = async (id: string): Promise<void | null> => {
        await BuyerModel.findByIdAndDelete(id);
    };

    findBuyerById = async (id: string): Promise<BuyerDocument | null> => {
        const buyer = await BuyerModel.findById(id).lean();
        return buyer;
    };

    findUserById = async (userId: string): Promise<BuyerDocument | null> => {
        const buyer = await BuyerModel.findOne({ userId: userId }).lean();
        // const buyer = await BuyerModel.findOne({ userId: new Schema.Types.ObjectId(userId) }).lean();
        return buyer;
    };

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