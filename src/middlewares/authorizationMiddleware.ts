import { NextFunction, Request, Response } from "express";
import { formatResponse } from "../utils/helper";
import { StatusCodes } from "http-status-codes";

export const authorizationMiddleware = (roles: string[]) => {

    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!roles.includes(user.role)) {
            return res.status(StatusCodes.FORBIDDEN).json(formatResponse("error", "You are not authorized to access this resource"));
        }
        next();
    }
}