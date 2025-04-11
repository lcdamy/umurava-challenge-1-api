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
const challengeModel_1 = __importDefault(require("../models/challengeModel"));
const cron = require('node-cron');
// Schedule a task to run at midnight
cron.schedule('0 0 * * *', () => {
    updateChallengeStatus();
});
module.exports = {};
function hasTheChallengeCompleted(endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today > endDate;
}
function hasTheChallengeStarted(startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= startDate;
}
function updateChallengeStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const challenges = yield challengeModel_1.default.find({ status: { $in: ['open', 'ongoing'] } });
            const updatePromises = challenges.map((challenge) => __awaiter(this, void 0, void 0, function* () {
                if (hasTheChallengeStarted(challenge.startDate) && !hasTheChallengeCompleted(challenge.endDate)) {
                    return challengeModel_1.default.findByIdAndUpdate(challenge._id, { status: 'ongoing' });
                }
                else if (hasTheChallengeCompleted(challenge.endDate)) {
                    return challengeModel_1.default.findByIdAndUpdate(challenge._id, { status: 'completed' });
                }
            }));
            yield Promise.all(updatePromises);
        }
        catch (error) {
            console.error('Error updating challenge status:', error);
        }
    });
}
