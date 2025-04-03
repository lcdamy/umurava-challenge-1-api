import { Schema, model, Document } from 'mongoose';

interface IChallengeParticipantsModel extends Document {
    challengeId: string;
    teamLead: Schema.Types.ObjectId; // Reference to a user
    members: string[]; // Array of emails
}

const challengeParticipantsModelSchema = new Schema<IChallengeParticipantsModel>({
    challengeId: {
        type: String,
        required: true
    },
    teamLead: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    members: {
        type: [String], // Array of strings (emails)
        validate: {
            validator: function (emails: string[]) {
                return emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
            },
            message: 'One or more emails are invalid.'
        }
    }
}, {
    timestamps: true
});

const ChallengeParticipantsModel = model<IChallengeParticipantsModel>('ChallengeParticipantsModel', challengeParticipantsModelSchema);

export default ChallengeParticipantsModel;