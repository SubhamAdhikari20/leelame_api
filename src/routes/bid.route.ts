// src/routes/bid.route.ts
import express from "express";
import { BidRepository } from "./../repositories/bid.repository.ts";
import { BidService } from "./../services/bid.service.ts";
import { BidController } from "./../controllers/bid.controller.ts";
import { UserRepository } from "./../repositories/user.repository.ts";
import { BuyerRepository } from "./../repositories/buyer.repository.ts";
import { BuyerAuthMiddleware } from "./../middleware/auth.middleware.ts";
import { ProductRepository } from "./../repositories/product.repository.ts";


const bidRepo = new BidRepository();
const productRepo = new ProductRepository();
const bidService = new BidService(bidRepo, productRepo);
const bidController = new BidController(bidService);

const userRepo = new UserRepository();
const buyerRepo = new BuyerRepository();
const buyerAuthMiddleware = new BuyerAuthMiddleware(userRepo, buyerRepo);

const router = express.Router();

router.post("/create-bid", buyerAuthMiddleware.protect, bidController.createBid);
router.put("/update-bid-details/:id", buyerAuthMiddleware.protect, bidController.updateBid);
router.delete("/delete-bid/:id", buyerAuthMiddleware.protect, bidController.deleteBid);
router.get("/get-all-bids", bidController.getAllBids);
router.get("/get-all-bids/:productId", bidController.findAllBidsByProductId);
router.get("/get-all-bids/:buyerId", bidController.findAllBidsByBuyerId);
router.get("/get-all-bids/:sellerId", bidController.findAllBidsBySellerId);

// Get Bid By ID Dynamic Route
router.get("/:id", buyerAuthMiddleware.protect, bidController.getBidById);

export default router;