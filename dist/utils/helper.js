"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalizeFirstLetter = exports.generateRandomPassword = exports.verifyToken = exports.generateToken = exports.formatResponse = void 0;
exports.convertToISO = convertToISO;
exports.getStartDate = getStartDate;
exports.getDuration = getDuration;
const date_fns_1 = require("date-fns");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function convertToISO(date) {
    const formats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'yyyy/MM/dd'];
    let parsedDate;
    for (const fmt of formats) {
        const tempDate = (0, date_fns_1.parse)(date, fmt, new Date());
        if (!isNaN(tempDate.getTime())) {
            parsedDate = tempDate;
            break;
        }
    }
    if (!parsedDate) {
        throw new Error('Invalid date format');
    }
    return (0, date_fns_1.format)(parsedDate, 'yyyy-MM-dd');
}
function getStartDate(endDate, duration) {
    const parsedEndDate = (0, date_fns_1.parse)(endDate, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid end date format');
    }
    const startDate = new Date(parsedEndDate);
    startDate.setDate(parsedEndDate.getDate() - duration);
    return (0, date_fns_1.format)(startDate, 'yyyy-MM-dd');
}
function getDuration(endDate, startDate) {
    const parsedEndDate = (0, date_fns_1.parse)(endDate, 'yyyy-MM-dd', new Date());
    const parsedStartDate = (0, date_fns_1.parse)(startDate, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedEndDate.getTime()) || isNaN(parsedStartDate.getTime())) {
        throw new Error('Invalid date format');
    }
    const duration = parsedEndDate.getTime() - parsedStartDate.getTime();
    return Math.ceil(duration / (1000 * 60 * 60 * 24));
}
const formatResponse = (status, message, data) => ({ status, message, data });
exports.formatResponse = formatResponse;
const generateToken = (payload, expiresIn) => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is not defined");
    }
    return jsonwebtoken_1.default.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is not defined");
    }
    try {
        return jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    }
    catch (error) {
        throw new Error("Invalid token");
    }
};
exports.verifyToken = verifyToken;
const generateRandomPassword = (length) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};
exports.generateRandomPassword = generateRandomPassword;
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
