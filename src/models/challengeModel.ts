import { Schema, model, Document } from 'mongoose';
import { ChallengeCategory } from '../types';

interface IChallenge extends Document {
    challengeName: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    moneyPrize: string;
    contactEmail: string;
    projectDescription: string;
    projectBrief: string;
    projectTasks: string;
    challengeCategory: ChallengeCategory;
    status: 'open' | 'ongoing' | 'completed'
}

const ChallengeSchema: Schema = new Schema({
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
    challengeCategory: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'ongoing', 'completed'],
        default: 'open'
    }
}, {
    timestamps: true
});

const Challenge = model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;