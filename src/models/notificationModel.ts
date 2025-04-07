import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
    timestamp: Date;
    type: string;
    message: string;
    title: string;
    userId: string;
    status: string;
}

const NotificationSchema = new Schema<INotification>({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'error']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'unread',
        enum: ['read', 'unread']
    }
});
const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;
