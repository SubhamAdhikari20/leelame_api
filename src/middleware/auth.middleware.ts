// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import asyncHandler from "./async.middleware.ts";
import type { UserRepositoryInterface } from "@/interfaces/user.repository.interface.ts";
import type { BuyerRepositoryInterface } from "@/interfaces/buyer.repository.interface.ts";


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

//PROTECT THE MIDDLEWARE
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
            // console.log(decoded);

            const baseUser = await this.userRepo.findUserById(decoded.userId.toString());
            if (!baseUser) {
                return res.status(404).json({ message: "Base user with this id not found!" });
            }
            console.log(baseUser);

            req.user = await this.buyerRepo.findBuyerById(decoded._id.toString());
            if (!req.user) {
                return res.status(404).json({ message: "Buyer with this id not found!" });
            }
            console.log(req.user);
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