"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const prizeSchema = new mongoose_1.Schema({
    prizeName: {
        type: String,
        required: true,
        unique: true
    },
    currency: {
        type: String,
        required: true,
        default: 'RWF'
    },
    description: {
        type: String,
    }
}, {
    timestamps: true
});
const Prize = (0, mongoose_1.model)('Prize', prizeSchema);
exports.default = Prize;
