import { Schema, model, Document } from 'mongoose';

export interface IAudit extends Document {
    timestamp: Date;
    method: string;
    url: string;
    statusCode: number;
    duration: string;
    userAgent: string;
    doneBy: string;
    ipAddress: string;
    activity: string;
    details: string;
    status: string;
}

const AuditSchema = new Schema<IAudit>({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    doneBy: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const Audit = model<IAudit>('Audit', AuditSchema);

export default Audit;
