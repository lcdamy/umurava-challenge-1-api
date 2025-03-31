import { Schema, model, Document } from 'mongoose';

interface IChallengeCategory extends Document {
    challengeCategoryName: string;
    description: string;
}

const challengeCategorySchema = new Schema<IChallengeCategory>({
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

const ChallengeCategory = model<IChallengeCategory>('ChallengeCategory', challengeCategorySchema);

export default ChallengeCategory;