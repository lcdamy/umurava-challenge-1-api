"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const skillSchema = new mongoose_1.Schema({
    skillName: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});
const Skill = (0, mongoose_1.model)('Skill', skillSchema);
exports.default = Skill;
