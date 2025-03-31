"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const helper_1 = require("../utils/helper");
const helper_2 = require("../utils/helper");
const authenticationMiddleware = () => {
    return (req, res, next) => {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_2.formatResponse)('error', 'Access denied'));
        }
        try {
            const decoded = (0, helper_1.verifyToken)(token);
            req.user = decoded;
            next();
        }
        catch (err) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_2.formatResponse)('error', 'Invalid token'));
        }
    };
};
exports.authenticationMiddleware = authenticationMiddleware;
