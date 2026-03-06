// src/services/order.service.ts
import type { OrderResponseDtoType, AllOrdersResponseDtoType, CreateOrderDtoType, UpdateOrderStatusDtoType, UpdateOrderDetailsDtoType } from "./../dtos/order.dto.ts";
import type { OrderRepositoryInterface } from "./../interfaces/order.repository.interface.ts";
import { HttpError } from "./../errors/http-error.ts";


export class OrderService {
    private orderRepo: OrderRepositoryInterface;

    constructor(orderRepo: OrderRepositoryInterface) {
        this.orderRepo = orderRepo;
    }

    createOrder = async (createOrder: CreateOrderDtoType): Promise<OrderResponseDtoType> => {
        const { productId, buyerId, sellerId, delivaryAddress, delivaryDate, totalPrice, status } = createOrder;

        const newOrder = await this.orderRepo.createOrder({
            productId: productId,
            buyerId: buyerId,
            sellerId: sellerId,
            delivaryAddress: delivaryAddress,
            delivaryDate: delivaryDate,
            totalPrice: totalPrice,
            status: status
        });

        if (!newOrder) {
            throw new HttpError(400, "Order is not created!");
        }

        const response: OrderResponseDtoType = {
            success: true,
            message: "Order placed successfully.",
            status: 201,
            data: {
                _id: newOrder._id.toString(),
                productId: newOrder.productId.toString(),
                buyerId: newOrder.buyerId.toString(),
                sellerId: newOrder.sellerId.toString(),
                delivaryAddress: newOrder.delivaryAddress,
                delivaryDate: newOrder.delivaryDate,
                totalPrice: newOrder.totalPrice,
                status: newOrder.status,
                createdAt: newOrder.createdAt,
                updatedAt: newOrder.updatedAt
            }
        };
        return response;
    };

    updateOrderDetails = async (orderId: string, updateOrderDetails: UpdateOrderDetailsDtoType): Promise<OrderResponseDtoType> => {
        const { productId, buyerId, sellerId, delivaryAddress, delivaryDate, totalPrice, status } = updateOrderDetails;
        const decodedOrderId = decodeURIComponent(orderId);

        const updatedOrder = await this.orderRepo.updateOrder(decodedOrderId, {
            productId: productId,
            buyerId: buyerId,
            sellerId: sellerId,
            delivaryAddress: delivaryAddress,
            delivaryDate: delivaryDate,
            totalPrice: totalPrice,
            status: status
        });

        if (!updatedOrder) {
            throw new HttpError(400, "Order details are not updated!");
        }

        const response: OrderResponseDtoType = {
            success: true,
            message: "Order details updated successfully.",
            status: 200,
            data: {
                _id: updatedOrder._id.toString(),
                productId: updatedOrder.productId.toString(),
                buyerId: updatedOrder.buyerId.toString(),
                sellerId: updatedOrder.sellerId.toString(),
                delivaryAddress: updatedOrder.delivaryAddress,
                delivaryDate: updatedOrder.delivaryDate,
                totalPrice: updatedOrder.totalPrice,
                status: updatedOrder.status,
                createdAt: updatedOrder.createdAt,
                updatedAt: updatedOrder.updatedAt
            }
        };
        return response;
    };

    updateOrderStatus = async (orderId: string, updateOrderStatus: UpdateOrderStatusDtoType): Promise<OrderResponseDtoType> => {
        const { status } = updateOrderStatus;
        const decodedOrderId = decodeURIComponent(orderId);

        const updatedOrder = await this.orderRepo.updateOrder(decodedOrderId, { status: status });

        if (!updatedOrder) {
            throw new HttpError(400, "Order status is not updated!");
        }

        const response: OrderResponseDtoType = {
            success: true,
            message: "Order status updated successfully.",
            status: 200,
            data: {
                _id: updatedOrder._id.toString(),
                productId: updatedOrder.productId.toString(),
                buyerId: updatedOrder.buyerId.toString(),
                sellerId: updatedOrder.sellerId.toString(),
                delivaryAddress: updatedOrder.delivaryAddress,
                delivaryDate: updatedOrder.delivaryDate,
                totalPrice: updatedOrder.totalPrice,
                status: updatedOrder.status,
                createdAt: updatedOrder.createdAt,
                updatedAt: updatedOrder.updatedAt
            }
        };
        return response;
    };

    deleteOrder = async (orderId: string): Promise<OrderResponseDtoType> => {
        const decodedOrderId = decodeURIComponent(orderId);
        const deletedOrder = await this.orderRepo.deleteOrder(decodedOrderId);
        if (!deletedOrder) {
            throw new HttpError(400, "Order is not deleted!");
        }

        const response: OrderResponseDtoType = {
            success: true,
            message: "Order deleted successfully.",
            status: 200
        };
        return response;
    };

    getOrderById = async (orderId: string): Promise<OrderResponseDtoType> => {
        const decodedOrderId = decodeURIComponent(orderId);
        const existingOrderById = await this.orderRepo.findOrderById(decodedOrderId);
        if (!existingOrderById) {
            throw new HttpError(404, "Order with this id not found!");
        }

        const response: OrderResponseDtoType = {
            success: true,
            message: "Order details updated successfully.",
            status: 200,
            data: {
                _id: existingOrderById._id.toString(),
                productId: existingOrderById.productId.toString(),
                buyerId: existingOrderById.buyerId.toString(),
                sellerId: existingOrderById.sellerId.toString(),
                delivaryAddress: existingOrderById.delivaryAddress,
                delivaryDate: existingOrderById.delivaryDate,
                totalPrice: existingOrderById.totalPrice,
                status: existingOrderById.status,
                createdAt: existingOrderById.createdAt,
                updatedAt: existingOrderById.updatedAt
            }
        };
        return response;
    };

    getAllOrders = async (): Promise<AllOrdersResponseDtoType> => {
        const allOrders = await this.orderRepo.getAllOrders();
        if (!allOrders) {
            throw new HttpError(404, "Orders could not be fetched!");
        }

        const orders = await Promise.all(
            allOrders.map(async (order) => {
                return {
                    _id: order._id.toString(),
                    productId: order.productId.toString(),
                    buyerId: order.buyerId.toString(),
                    sellerId: order.sellerId.toString(),
                    delivaryAddress: order.delivaryAddress,
                    delivaryDate: order.delivaryDate,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };
            })
        );

        const response: AllOrdersResponseDtoType = {
            success: true,
            message: "All orders fetched successfully.",
            status: 200,
            data: orders
        };
        return response;
    };

    findAllOrdersByProductId = async (productId: string): Promise<AllOrdersResponseDtoType> => {
        const allOrdersByProductId = await this.orderRepo.findAllOrdersByProductId(productId);
        if (!allOrdersByProductId) {
            throw new HttpError(404, "Orders could not be fetched with this product id!");
        }

        const orders = await Promise.all(
            allOrdersByProductId.map(async (order) => {
                return {
                    _id: order._id.toString(),
                    productId: order.productId.toString(),
                    buyerId: order.buyerId.toString(),
                    sellerId: order.sellerId.toString(),
                    delivaryAddress: order.delivaryAddress,
                    delivaryDate: order.delivaryDate,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };
            })
        );

        const response: AllOrdersResponseDtoType = {
            success: true,
            message: "All orders with this product id fetched successfully.",
            status: 200,
            data: orders
        };
        return response;
    };

    findAllOrdersByBuyerId = async (buyerId: string): Promise<AllOrdersResponseDtoType> => {
        const allOrdersByBuyerId = await this.orderRepo.findAllOrdersByBuyerId(buyerId);
        if (!allOrdersByBuyerId) {
            throw new HttpError(404, "Orders could not be fetched with this buyer id!");
        }

        const orders = await Promise.all(
            allOrdersByBuyerId.map(async (order) => {
                return {
                    _id: order._id.toString(),
                    productId: order.productId.toString(),
                    buyerId: order.buyerId.toString(),
                    sellerId: order.sellerId.toString(),
                    delivaryAddress: order.delivaryAddress,
                    delivaryDate: order.delivaryDate,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };
            })
        );

        const response: AllOrdersResponseDtoType = {
            success: true,
            message: "All orders with this buyer id fetched successfully.",
            status: 200,
            data: orders
        };
        return response;
    };

    findAllOrdersBySellerId = async (sellerId: string): Promise<AllOrdersResponseDtoType> => {
        const allOrdersBySellerId = await this.orderRepo.findAllOrdersBySellerId(sellerId);
        if (!allOrdersBySellerId) {
            throw new HttpError(404, "Orders could not be fetched with this seller id!");
        }

        const orders = await Promise.all(
            allOrdersBySellerId.map(async (order) => {
                return {
                    _id: order._id.toString(),
                    productId: order.productId.toString(),
                    buyerId: order.buyerId.toString(),
                    sellerId: order.sellerId.toString(),
                    delivaryAddress: order.delivaryAddress,
                    delivaryDate: order.delivaryDate,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };
            })
        );

        const response: AllOrdersResponseDtoType = {
            success: true,
            message: "All orders with this seller id fetched successfully.",
            status: 200,
            data: orders
        };
        return response;
    };
}