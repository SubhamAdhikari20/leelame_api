// src/repositories/invoice.repository.ts
import type { InvoiceRepositoryInterface } from "./../interfaces/invoice.repository.interface.ts";
import type { Invoice, InvoiceDocument } from "./../types/invoice.type.ts";
import InvoiceModel from "./../models/invoice.model.ts";


export class InvoiceRepository implements InvoiceRepositoryInterface {
    createInvoice = async (invoice: Invoice): Promise<InvoiceDocument | null> => {
        const newInvoice = await InvoiceModel.create(invoice);
        return newInvoice;
    };

    deleteInvoice = async (id: string): Promise<boolean> => {
        const deletedInvoice = await InvoiceModel.findByIdAndDelete(id);
        if (!deletedInvoice) {
            return false;
        }
        return true;
    };

    findInvoiceById = async (id: string): Promise<InvoiceDocument | null> => {
        const invoice = await InvoiceModel.findById(id).lean();
        return invoice;
    };

    findInvoiceByTransactionId = async (transactionId: string): Promise<InvoiceDocument | null> => {
        const invoice = await InvoiceModel.findOne({ transactionId: transactionId }).lean();
        return invoice;
    };

    getAllInvoices = async (): Promise<InvoiceDocument[] | null> => {
        const invoices = await InvoiceModel.find().lean();
        return invoices;
    };
}