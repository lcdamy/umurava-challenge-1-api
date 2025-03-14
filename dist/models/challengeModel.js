"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChallengeSchema = new mongoose_1.Schema({
    challengeName: {
        type: String,
        required: true,
        unique: true
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
        type: String,
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
    projectBrief: {
        type: String,
        required: true
    },
    projectTasks: {
        type: String,
        required: true
    },
    participants: {
        type: [String],
        default: []
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
        enum: ['open', 'ongoing', 'completed'],
        default: 'open'
    }
}, {
    timestamps: true
});
ChallengeSchema.methods.joinChallenge = function (participant) {
    if (!this.participants.includes(participant)) {
        this.participants.push(participant);
        this.save();
    }
};
const Challenge = (0, mongoose_1.model)('Challenge', ChallengeSchema);
exports.default = Challenge;
