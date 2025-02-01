import { Schema, model, Document } from 'mongoose';

interface IChallenge extends Document {
    challengeName: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    moneyPrize: string;
    contactEmail: string;
    projectDescription: string;
    projectBrief: string;
    projectTasks: string;
    challengeCategory: 'Web Design' | 'UI/UX' | 'Frontend' | 'Backend' | 'Fullstack' | 'Mobile' | 'Data Science' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering' | 'Biomedical Engineering' | 'Chemical Engineering' | 'Environmental Engineering' | 'Industrial Engineering' | 'Materials Engineering' | 'Petroleum Engineering' | 'Software Engineering' | 'Telecommunications' | 'Network Engineering' | 'Cybersecurity' | 'Cloud Computing' | 'DevOps' | 'AI/ML' | 'IoT' | 'Blockchain' | 'AR/VR' | 'Game Development' | 'Robotics' | 'Digital Marketing' | 'Content Writing' | 'Graphic Design' | 'Video Editing' | 'Animation' | 'Music Production' | 'Photography' | '3D Modelling' | 'CAD Design' | 'Interior Design' | 'Fashion Design' | 'Product Design' | 'Architecture' | 'Civil Engineering' | 'Mechanical Engineering' | 'Electrical Engineering' | 'Aerospace Engineering' | 'Automotive Engineering',
    status: 'open' | 'ongoing' | 'completed'
}

const ChallengeSchema: Schema = new Schema({
    challengeName: {
        type: String,
        required: true,
        unique: true
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
        type: String,
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
    projectBrief: {
        type: String,
        required: true
    },
    projectTasks: {
        type: String,
        required: true
    },
    challengeCategory: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'ongoing', 'completed'],
        default: 'open'
    }
}, {
    timestamps: true
});

const Challenge = model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;