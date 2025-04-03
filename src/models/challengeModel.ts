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
    teamSize: number;
    skills: Array<string>;
    levels: Array<string>;
    status: 'open' | 'ongoing' | 'completed';

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
        enum: ['draft', 'open', 'ongoing', 'completed'],
        default: 'draft'
    }
}, {
    timestamps: true
});


const Challenge = model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;