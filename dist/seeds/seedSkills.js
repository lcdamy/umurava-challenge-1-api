"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const skillsModel_1 = __importDefault(require("../models/skillsModel")); // Adjust the path if necessary ../models/Skill
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedSkills = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to your MongoDB database
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb+srv://zudanga:a15LoLgUAHKn9Tfv@cluster0.djtfu.mongodb.net/umurava-challenge-db-api?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to the database.');
        // Define the skills to seed
        const skills = [
            { skillName: 'UI/UX Design', status: 'active' },
            { skillName: 'Data Science', status: 'active' },
            { skillName: 'Graphic Design', status: 'active' },
            { skillName: 'Data Analysis & Research', status: 'active' },
            { skillName: 'Animation', status: 'active' },
            { skillName: 'Videography', status: 'active' },
            { skillName: 'Photography', status: 'active' },
            { skillName: 'AI & Machine Learning', status: 'active' },
            { skillName: 'Web3', status: 'active' },
            { skillName: 'Digital Marketing & Communications', status: 'active' },
        ];
        // Clear existing skills
        yield skillsModel_1.default.deleteMany({});
        console.log('Existing skills cleared.');
        // Insert new skills
        yield skillsModel_1.default.insertMany(skills);
        console.log('Skills seeded successfully.');
        // Close the database connection
        yield mongoose_1.default.disconnect();
        console.log('Database connection closed.');
    }
    catch (error) {
        console.error('Error seeding skills:', error);
        process.exit(1);
    }
});
seedSkills();
