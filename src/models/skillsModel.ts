import { Schema, model, Document } from 'mongoose';

interface ISkill extends Document {
    skillName: string;
    status: 'active' | 'inactive';
}

const skillSchema = new Schema<ISkill>({
    skillName: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Skill = model<ISkill>('Skill', skillSchema);

export default Skill;