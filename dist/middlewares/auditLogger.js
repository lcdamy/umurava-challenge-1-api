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
exports.auditLogger = void 0;
const auditModel_1 = __importDefault(require("../models/auditModel"));
const auditLogger = (req, res, next) => {
    const startTime = Date.now();
    let oldSend = res.send;
    res.send = function (data) {
        res.locals.body = data;
        return oldSend.call(res, data);
    };
    res.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
        const endTime = Date.now();
        const duration = `${endTime - startTime}ms`; // duration is in milliseconds
        const auditLog = new auditModel_1.default();
        const xForwardedFor = req.headers['x-forwarded-for'];
        auditLog.timestamp = new Date();
        auditLog.method = req.method;
        auditLog.url = req.originalUrl;
        auditLog.statusCode = res.statusCode;
        auditLog.duration = duration;
        auditLog.userAgent = req.headers['user-agent'] || 'unknown';
        auditLog.ipAddress = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor || req.ip || 'unknown';
        let responseBody;
        try {
            responseBody = JSON.parse(res.locals.body);
        }
        catch (error) {
            responseBody = { message: 'unknown', status: 'unknown' };
        }
        auditLog.activity = req.method;
        auditLog.details = responseBody.message || 'unknown';
        auditLog.status = responseBody.status || 'unknown';
        // Check if the user is authenticated and get the email
        auditLog.doneBy = 'unknown';
        // Save the audit log to the database
        yield auditLog.save().catch((err) => {
            console.error('Error saving audit log:', err);
        });
        console.log('Audit log saved successfully!');
    }));
    next();
};
exports.auditLogger = auditLogger;
