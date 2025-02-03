import { Schema, model, Document } from 'mongoose';
import { ChallengeCategory } from '../types';
import { string } from 'joi';

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
    participants: Array<{ participant: string, joinedAt: Date }>;
    skills: Array<ChallengeCategory>;
    levels: Array<string>;
    status: 'open' | 'ongoing' | 'completed';
    joinChallenge(participant: any): void;
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
    participants: {
        type: [{
            participant: String
        }],
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

ChallengeSchema.methods.joinChallenge = function (participant: string): void {
    if (!this.participants.includes(participant)) {
        this.participants.push(participant);
        this.save();
    }
};

const Challenge = model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;