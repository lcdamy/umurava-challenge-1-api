import Challenge from "../models/challengeModel";

const cron = require('node-cron');

// Schedule a task to run at midnight
cron.schedule('0 0 * * *', () => {
    updateChallengeStatus();
});

module.exports = {};

function hasTheChallengeCompleted(endDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today > endDate;
}

function hasTheChallengeStarted(startDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= startDate;
}

async function updateChallengeStatus() {
    try {
        const challenges = await Challenge.find({ status: { $in: ['open', 'ongoing'] } });
        const updatePromises = challenges.map(async (challenge) => {
            if (hasTheChallengeStarted(challenge.startDate) && !hasTheChallengeCompleted(challenge.endDate)) {
                return Challenge.findByIdAndUpdate(challenge._id, { status: 'ongoing' });
            } else if (hasTheChallengeCompleted(challenge.endDate)) {
                return Challenge.findByIdAndUpdate(challenge._id, { status: 'completed' });
            }
        });
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error updating challenge status:', error);
    }
}