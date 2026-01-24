// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import asyncHandler from "./async.middleware.ts";
import type { UserRepositoryInterface } from "@/interfaces/user.repository.interface.ts";
import type { BuyerRepositoryInterface } from "@/interfaces/buyer.repository.interface.ts";
import type { SellerRepositoryInterface } from "@/interfaces/seller.repository.interface.ts";


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

//Protect the buyer middleware
export class AuthMiddleware {
    private userRepo: UserRepositoryInterface;
    private buyerRepo: BuyerRepositoryInterface;

    constructor(userRepo: UserRepositoryInterface, buyerRepo: BuyerRepositoryInterface) {
        this.userRepo = userRepo;
        this.buyerRepo = buyerRepo;
    }

    //Protect routes
    protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // Set token from Bearer token in header
            token = req.headers.authorization.split(" ")[1];
        }

        //Make sure token exist
        if (!token) {
            // return next(new HttpError(401, 'Not authorized to access this route'));
            return res.status(401).json({ message: "Not authorized to access this route" });
        }

        try {
            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            if (!decoded) {
                return res.status(400).json({ message: "JWT Error! The token is not decoded." });
            }

            if (decoded.role && decoded.role === "buyer") {
                return res.status(400).json({ message: "Invalid role! Role should be 'buyer'." });
            }

            const baseUser = await this.userRepo.findUserById(decoded.userId.toString());
            if (!baseUser) {
                return res.status(404).json({ message: "Base user with this id not found!" });
            }

            if ((decoded.role !== baseUser.role)) {
                return res.status(400).json({ message: "Role Error! The role is mismatched with the fetched base user." });
            }

            req.user = await this.buyerRepo.findBuyerById(decoded._id.toString());
            if (!req.user) {
                return res.status(404).json({ message: "Buyer with this id not found!" });
            }

            next();
        } catch (err) {
            // return next(new HttpError(401, 'Not authorized to access this route'));
            return res.status(401).json({ message: "Not authorized to access this route" });
        }
    });

    // Grant access to specific roles , i.e publisher and admin
    authorize = (...roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            ///check if it is admin or publisher. user cannot access
            //  console.log(req.user.role);
            if (!roles.includes(req.user.role)) {
                // return next(new HttpError(403, `User role ${req.user.roles} is not authorized to access this route`));
                return res.status(403).json({
                    message: `User role ${req.user.roles} is not authorized to access this route`,
                });
            }
            next();
        };
    };
}

//Protect the seller middleware
export class SellerAuthMiddleware {
    private userRepo: UserRepositoryInterface;
    private sellerRepo: SellerRepositoryInterface;

    constructor(userRepo: UserRepositoryInterface, sellerRepo: SellerRepositoryInterface) {
        this.userRepo = userRepo;
        this.sellerRepo = sellerRepo;
    }

    //Protect routes
    protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        //Make sure token exist
        if (!token) {
            // return next(new HttpError(401, 'Not authorized to access this route'));
            return res.status(401).json({ message: "Not authorized to access this route" });
        }

        try {
            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            if (!decoded) {
                return res.status(400).json({ message: "JWT Error! The token is not decoded." });
            }

            if (decoded.role && decoded.role === "seller") {
                return res.status(400).json({ message: "Invalid role! Role should be 'seller'." });
            }

            const baseUser = await this.userRepo.findUserById(decoded.userId.toString());
            if (!baseUser) {
                return res.status(404).json({ message: "Base user with this id not found!" });
            }

            if ((decoded.role !== baseUser.role)) {
                return res.status(400).json({ message: "Role Error! The role is mismatched with the fetched base user." });
            }

            req.user = await this.sellerRepo.findSellerById(decoded._id.toString());
            if (!req.user) {
                return res.status(404).json({ message: "Buyer with this id not found!" });
            }

            next();
        } catch (err) {
            return res.status(401).json({ message: "Not authorized to access this route" });
        }
    });

    authorize = (...roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    message: `User role ${req.user.roles} is not authorized to access this route`,
                });
            }
            next();
        };
    };
}