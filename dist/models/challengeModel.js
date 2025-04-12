"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChallengeSchema = new mongoose_1.Schema({
    challengeName: {
        type: String,
        required: true,
        unique: true
    },
    challengeCategory: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    moneyPrize: {
        type: [
            {
                categoryPrize: { type: String, required: true },
                prize: { type: Number, required: true },
                currency: { type: String, required: true, default: 'RWF' }
            }
        ],
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    projectDescription: {
        type: String,
        required: true
    },
    teamSize: {
        type: Number,
        required: true,
        min: 1
    },
    skills: {
        type: [String],
        default: []
    },
    levels: {
        type: [String],
        default: ["Junior", "Intermediate", "Senior"]
    },
    status: {
        type: String,
        enum: ['draft', 'open', 'ongoing', 'completed', 'closed'],
        default: 'draft'
    }
}, {
    timestamps: true
});
const Challenge = (0, mongoose_1.model)('Challenge', ChallengeSchema);
exports.default = Challenge;
