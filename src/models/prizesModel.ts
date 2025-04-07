import { Schema, model, Document } from 'mongoose';

interface IPrize extends Document {
    prizeName: string;
    currency: string;
    description: string;
}

const prizeSchema = new Schema<IPrize>({
    prizeName: {
        type: String,
        required: true,
        unique: true
    },
    currency: {
        type: String,
        required: true,
        default: 'RWF'
    },
    description: {
        type: String,
    }
}, {
    timestamps: true
});

const Prize = model<IPrize>('Prize', prizeSchema);

export default Prize;