"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuditSchema = new mongoose_1.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    doneBy: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});
const Audit = (0, mongoose_1.model)('Audit', AuditSchema);
exports.default = Audit;
