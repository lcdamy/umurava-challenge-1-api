"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subscribersSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'], // Example values
        default: 'active'
    }
}, {
    timestamps: true
});
const Subscribers = (0, mongoose_1.model)('Subscribers', subscribersSchema);
exports.default = Subscribers;
