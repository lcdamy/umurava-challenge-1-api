import { Schema, model, Document } from 'mongoose';

interface IChallenge extends Document {
    challengeName: string;
    challengeCategory: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    moneyPrize: Array<{ categoryPrize: string; prize: number }>;
    contactEmail: string;
    projectDescription: string;
    participants: Array<string>;
    teamSize: number;
    skills: Array<string>;
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
                prize: { type: Number, required: true }
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
    participants: {
        type: [String],
        default: []
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