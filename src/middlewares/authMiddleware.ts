import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { UserRole, UserPayload } from "../types";
import { formatResponse } from '../utils/helper';

exports.identifier = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'No token provided'));
    }

    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Token secret is not defined'));
    }
    jwt.verify(token, secret, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Failed to authenticate token'));
        }
        req.user = decoded as UserPayload;
        next();
    });
}

// Middleware to check user if is Admin
exports.AdminAuthorized = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || req.user.userRole !== UserRole.Admin) {
            return res.status(StatusCodes.FORBIDDEN).json(formatResponse('error', 'Access denied'));
        }
        next();
    };
};

// Middleware to check user if is Participant
exports.ParticipantAuthorized = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || req.user.userRole !== UserRole.Participant) {
            return res.status(StatusCodes.FORBIDDEN).json(formatResponse('error', 'Access denied'));
        }
        next();
    };
};