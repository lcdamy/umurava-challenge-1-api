import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/helper";
import { formatResponse } from '../utils/helper';

export const authenticationMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Access denied'));
        }
        try {
            const decoded = verifyToken(token);
            (req as any).user = decoded;
            next();
        } catch (err) {
            res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Invalid token'));
        }
    };
}