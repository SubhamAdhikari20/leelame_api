// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { UserRepositoryInterface } from "./../interfaces/user.repository.interface.ts";
import type { BuyerRepositoryInterface } from "./../interfaces/buyer.repository.interface.ts";
import type { SellerRepositoryInterface } from "./../interfaces/seller.repository.interface.ts";
import type { AdminRepositoryInterface } from "./../interfaces/admin.repository.interface.ts";
import asyncHandler from "./async.middleware.ts";
import { HttpError } from "./../errors/http-error.ts";


type User = {
    _id: string;
    email: string;
    role: string;
    isVerified: boolean;
    baseUserId: string;
    fullName: string;
    username?: string | null;
    contact?: string | null;
    isPermanentlyBanned: boolean;
};

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | User | null;
        }
    }
}

//Protect the buyer middleware
export class BuyerAuthMiddleware {
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
        if (!token || token === "") {
            throw new HttpError(401, "Not authorized to access this route");
        }

        try {
            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            if (!decoded) {
                throw new HttpError(400, "JWT Error! The token is not decoded.");
            }

            if (decoded.role && decoded.role === "buyer") {
                throw new HttpError(400, "Invalid role! Role should be 'buyer'.");
            }

            const baseUser = await this.userRepo.findUserById(decoded.baseUserId.toString());
            if (!baseUser) {
                throw new HttpError(404, "Base user with this id not found!");
            }

            if ((decoded.role !== baseUser.role)) {
                throw new HttpError(400, "Role Error! The role is mismatched with the fetched base user.");
            }

            const buyer = await this.buyerRepo.findBuyerById(decoded._id.toString());
            if (!buyer) {
                throw new HttpError(401, "Unauthorized buyer with this id not found!");
            }

            req.user = buyer;
            next();
        }
        catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message ?? "Not authorized to access this route!" });
        }
    });

    // Grant access to specific roles , i.e publisher and admin
    authorize = (...roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            ///check if it is admin or publisher. user cannot access
            //  console.log(req.user.role);
            if (!roles.includes(req.user?.role)) {
                return res.status(403).json({
                    message: `User role ${req.user?.role} is not authorized to access this route!`,
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
        if (!token || token === "") {
            throw new HttpError(401, "Not authorized to access this route");
        }

        try {
            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            if (!decoded) {
                throw new HttpError(400, "JWT Error! The token is not decoded.");
            }

            if (decoded.role && decoded.role === "seller") {
                throw new HttpError(400, "Invalid role! Role should be 'seller'.");
            }

            const baseUser = await this.userRepo.findUserById(decoded.baseUserId.toString());
            if (!baseUser) {
                throw new HttpError(404, "Base user with this id not found!");
            }

            if ((decoded.role !== baseUser.role)) {
                throw new HttpError(400, "Role Error! The role is mismatched with the fetched base user.");
            }

            const seller = await this.sellerRepo.findSellerById(decoded._id.toString());
            if (!seller) {
                throw new HttpError(401, "Unauthorized seller with this id not found!");
            }

            req.user = seller;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Not authorized to access this route!" });
        }
    });

    authorize = (...roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!roles.includes(req.user?.role)) {
                return res.status(403).json({
                    message: `User role ${req.user?.role} is not authorized to access this route!`,
                });
            }
            next();
        };
    };
}

//Protect the admin middleware
export class AdminAuthMiddleware {
    private userRepo: UserRepositoryInterface;
    private adminRepo: AdminRepositoryInterface;

    constructor(userRepo: UserRepositoryInterface, adminRepo: AdminRepositoryInterface) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
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
        if (!token || token === "") {
            throw new HttpError(401, "Not authorized to access this route");
        }

        try {
            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            if (!decoded) {
                throw new HttpError(400, "JWT Error! The token is not decoded.");
            }

            if (decoded.role && decoded.role === "admin") {
                throw new HttpError(400, "Invalid role! Role should be 'admin'.");
            }

            const baseUser = await this.userRepo.findUserById(decoded.baseUserId.toString());
            if (!baseUser) {
                throw new HttpError(404, "Base user with this id not found!");
            }

            if ((decoded.role !== baseUser.role)) {
                throw new HttpError(400, "Role Error! The role is mismatched with the fetched base user.");
            }

            const admin = await this.adminRepo.findAdminById(decoded._id.toString());
            if (!admin) {
                throw new HttpError(401, "Unauthorized admin with this id not found!");
            }

            req.user = admin;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Not authorized to access this route!" });
        }
    });

    authorize = (...roles: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!roles.includes(req.user?.role)) {
                return res.status(403).json({
                    message: `User role ${req.user?.role} is not authorized to access this route!`,
                });
            }
            next();
        };
    };
}