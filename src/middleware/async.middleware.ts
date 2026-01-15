// src/middleware/async.middleware.ts
import type { Request, Response, NextFunction } from "express";

// Try catch block will be handeled with this file
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
}

export default asyncHandler;