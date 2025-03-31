"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizationMiddleware = void 0;
const helper_1 = require("../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const authorizationMiddleware = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!roles.includes(user.role)) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json((0, helper_1.formatResponse)("error", "You are not authorized to access this resource"));
        }
        next();
    };
};
exports.authorizationMiddleware = authorizationMiddleware;
