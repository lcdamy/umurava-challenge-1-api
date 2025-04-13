"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudits = void 0;
const auditModel_1 = __importDefault(require("../../models/auditModel"));
const helper_1 = require("../../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
// Get all audits
const getAudits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const audits = yield auditModel_1.default.find({})
            .sort({ timestamp: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalAudits = yield auditModel_1.default.countDocuments({});
        const totalPages = Math.ceil(totalAudits / limitNumber);
        logger_1.default.info('Audits fetched successfully with pagination');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Audits fetched successfully', {
            audits,
            pagination: {
                totalAudits,
                totalPages,
                currentPage: pageNumber,
                pageSize: limitNumber
            }
        }));
    }
    catch (error) {
        logger_1.default.error('Error fetching audits', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching audits', error));
    }
});
exports.getAudits = getAudits;
