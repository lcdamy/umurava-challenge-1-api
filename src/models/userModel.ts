import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    names: string;
    email: string;
    userRole: string;
    profile_url: string;
    phoneNumber: string;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    names: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    userRole: {
        type: String,
        enum: ['admin', 'participant'],
        default: 'participant'
    },
    profile_url: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
});

const User = model<IUser>('User', UserSchema);

export default User;
