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
const challengeCategoryModel_1 = __importDefault(require("../models/challengeCategoryModel")); // Adjust the path if necessary ../models/seedChallengeCategory
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedseedChallengeCategorys = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to your MongoDB database
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb+srv://zudanga:a15LoLgUAHKn9Tfv@cluster0.djtfu.mongodb.net/umurava-challenge-db-api?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to the database.');
        // Define the challengeCategory to seed
        const challengeCategory = [
            { challengeCategoryName: 'Tech & IT', description: 'Challenges related to technology and information technology.' },
            { challengeCategoryName: 'Data & AI', description: 'Challenges related to data analysis, artificial intelligence, and machine learning.' },
            { challengeCategoryName: 'Digital Marketing & Communications', description: 'Challenges related to online marketing, branding, and communication strategies.' },
            { challengeCategoryName: 'Digital Creative & Content Production', description: 'Challenges related to creating digital content and creative production.' }
        ];
        // Clear existing challengeCategory
        yield challengeCategoryModel_1.default.deleteMany({});
        console.log('Existing challengeCategory cleared.');
        // Insert new challengeCategory
        yield challengeCategoryModel_1.default.insertMany(challengeCategory);
        console.log('seedChallengeCategorys seeded successfully.');
        // Close the database connection
        yield mongoose_1.default.disconnect();
        console.log('Database connection closed.');
    }
    catch (error) {
        console.error('Error seeding challengeCategory:', error);
        process.exit(1);
    }
});
seedseedChallengeCategorys();
