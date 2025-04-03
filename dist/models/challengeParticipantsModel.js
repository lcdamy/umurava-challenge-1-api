"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const challengeParticipantsModelSchema = new mongoose_1.Schema({
    challengeId: {
        type: String,
        required: true
    },
    teamLead: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    members: {
        type: [String], // Array of strings (emails)
        validate: {
            validator: function (emails) {
                return emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
            },
            message: 'One or more emails are invalid.'
        }
    }
}, {
    timestamps: true
});
const ChallengeParticipantsModel = (0, mongoose_1.model)('ChallengeParticipantsModel', challengeParticipantsModelSchema);
exports.default = ChallengeParticipantsModel;
