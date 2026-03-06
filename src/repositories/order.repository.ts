// src/repositories/order.repository.ts
import type { OrderRepositoryInterface } from "./../interfaces/order.repository.interface.ts";
import type { Order, OrderDocument } from "./../types/order.type.ts";
import OrderModel from "./../models/order.model.ts";
import ProductModel from "./../models/product.model.ts";


export class OrderRepository implements OrderRepositoryInterface {
    createOrder = async (order: Order): Promise<OrderDocument | null> => {
        const newOrder = await OrderModel.create(order);
        return newOrder;
    };

    updateOrder = async (id: string, order: Partial<Order>): Promise<OrderDocument | null> => {
        const updatedOrder = await OrderModel.findByIdAndUpdate(id, order, { new: true }).lean();
        return updatedOrder;
    };

    deleteOrder = async (id: string): Promise<boolean> => {
        const deletedOrder = await OrderModel.findByIdAndDelete(id);
        if (!deletedOrder) {
            return false;
        }
        return true;
    };

    findOrderById = async (id: string): Promise<OrderDocument | null> => {
        const order = await OrderModel.findById(id).lean();
        return order;
    };

    findOrderByProductId = async (productId: string): Promise<OrderDocument | null> => {
        const order = await OrderModel.findOne({ productId: productId }).lean();
        return order;
    };

    findOrderByBuyerId = async (buyerId: string): Promise<OrderDocument | null> => {
        const order = await OrderModel.findOne({ buyerId: buyerId }).lean();
        return order;
    };

    findOrderBySellerId = async (sellerId: string): Promise<OrderDocument | null> => {
        const product = await ProductModel.findOne({ sellerId: sellerId }).lean();
        if (!product) {
            return null;
        }

        const order = await OrderModel.findOne({ productId: product._id.toString() }).lean();
        return order;
    };

    findAllOrdersByProductId = async (productId: string): Promise<OrderDocument[] | null> => {
        const orders = await OrderModel.find({ productId: productId }).lean();
        return orders;
    };

    findAllOrdersByBuyerId = async (buyerId: string): Promise<OrderDocument[] | null> => {
        const orders = await OrderModel.find({ buyerId: buyerId }).lean();
        return orders;
    };

    findAllOrdersBySellerId = async (sellerId: string): Promise<OrderDocument[] | null> => {
        const products = await ProductModel.find({ sellerId: sellerId }).lean();
        if (!products || products.length === 0) {
            return null;
        }

        const productIds = products.map((product) => product._id.toString());
        const orders = await OrderModel.find({ productId: { $in: productIds } }).lean();
        return orders;
    };

    getAllOrders = async (): Promise<OrderDocument[] | null> => {
        const orders = await OrderModel.find().lean();
        return orders;
    };
}