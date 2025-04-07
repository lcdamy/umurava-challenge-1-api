"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'error']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'unread',
        enum: ['read', 'unread']
    }
});
const Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
exports.default = Notification;
