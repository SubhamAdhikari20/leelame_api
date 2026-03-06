// src/interfaces/order.repository.interface.ts
import type { OrderDocument, Order } from "./../types/order.type.ts";


export interface OrderRepositoryInterface {
    createOrder(order: Order): Promise<OrderDocument | null>;
    updateOrder(id: string, order: Partial<Order>): Promise<OrderDocument | null>;
    deleteOrder(id: string): Promise<boolean>;
    findOrderById(id: string): Promise<OrderDocument | null>;
    findOrderByProductId(productId: string): Promise<OrderDocument | null>;
    findOrderByBuyerId(buyerId: string): Promise<OrderDocument | null>;
    findOrderBySellerId(sellerId: string): Promise<OrderDocument | null>;
    findAllOrdersByProductId(productId: string): Promise<OrderDocument[] | null>;
    findAllOrdersByBuyerId(buyerId: string): Promise<OrderDocument[] | null>;
    findAllOrdersBySellerId(sellerId: string): Promise<OrderDocument[] | null>;
    getAllOrders(): Promise<OrderDocument[] | null>;
}