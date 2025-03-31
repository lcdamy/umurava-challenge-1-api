"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types");
const helper_1 = require("../utils/helper");
exports.identifier = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'No token provided'));
    }
    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Token secret is not defined'));
    }
    jsonwebtoken_1.default.verify(token, secret, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Failed to authenticate token'));
        }
        req.user = decoded;
        next();
    });
};
// Middleware to check user if is Admin
exports.AdminAuthorized = () => {
    return (req, res, next) => {
        if (!req.user || req.user.userRole !== types_1.UserRole.Admin) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json((0, helper_1.formatResponse)('error', 'Access denied'));
        }
        next();
    };
};
// Middleware to check user if is Participant
exports.ParticipantAuthorized = () => {
    return (req, res, next) => {
        if (!req.user || req.user.userRole !== types_1.UserRole.Participant) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json((0, helper_1.formatResponse)('error', 'Access denied'));
        }
        next();
    };
};
