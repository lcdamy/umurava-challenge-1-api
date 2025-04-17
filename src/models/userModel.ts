import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    names: string;
    email: string;
    userRole: 'admin' | 'participant';
    profile_url: string;
    password: string;
    status: 'active' | 'inactive' | 'slept' | 'deactivate';
}

const UserSchema = new Schema<IUser>({
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
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deactivate', 'slept'],
        default: 'inactive'
    },


});

const User = model<IUser>('User', UserSchema);

export default User;
