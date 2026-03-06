// src/interfaces/invoice.repository.interface.ts
import type { InvoiceDocument, Invoice } from "./../types/invoice.type.ts";


export interface InvoiceRepositoryInterface {
    createInvoice(invoice: Invoice): Promise<InvoiceDocument | null>;
    deleteInvoice(id: string): Promise<boolean>;
    findInvoiceById(id: string): Promise<InvoiceDocument | null>;
    findInvoiceByTransactionId(transactionId: string): Promise<InvoiceDocument | null>;
    getAllInvoices(): Promise<InvoiceDocument[] | null>;
}