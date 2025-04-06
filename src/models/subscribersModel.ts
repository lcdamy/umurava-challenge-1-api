import { Schema, model, Document } from 'mongoose';

interface ISubscribersModel extends Document {
    email: string;
    status: string;
}

const subscribersSchema = new Schema<ISubscribersModel>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'], // Example values
        default: 'active'
    }
}, {
    timestamps: true
});

const Subscribers = model<ISubscribersModel>('Subscribers', subscribersSchema);

export default Subscribers;