"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const challengeCategorySchema = new mongoose_1.Schema({
    challengeCategoryName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});
const ChallengeCategory = (0, mongoose_1.model)('ChallengeCategory', challengeCategorySchema);
exports.default = ChallengeCategory;
