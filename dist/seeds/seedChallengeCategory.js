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
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umurava-challenge-db-api');
        console.log('Connected to the database.');
        // Define the challengeCategory to seed
        const challengeCategory = [
            { challengeCategoryName: 'Web development', description: 'Challenges related to building and maintaining websites and web applications.' },
            { challengeCategoryName: 'Mobile development', description: 'Challenges focused on creating applications for mobile devices.' },
            { challengeCategoryName: 'Data science', description: 'Challenges involving data analysis, machine learning, and statistical modeling.' },
            { challengeCategoryName: 'Game development', description: 'Challenges related to designing and developing video games.' },
            { challengeCategoryName: 'Cybersecurity', description: 'Challenges focused on protecting systems and networks from cyber threats.' },
            { challengeCategoryName: 'Cloud computing', description: 'Challenges related to cloud services, deployment, and architecture.' },
            { challengeCategoryName: 'Artificial Intelligence', description: 'Challenges involving AI algorithms, models, and applications.' },
            { challengeCategoryName: 'Blockchain', description: 'Challenges related to blockchain technology and decentralized applications.' },
            { challengeCategoryName: 'Internet of Things (IoT)', description: 'Challenges focused on IoT devices and applications.' },
            { challengeCategoryName: 'DevOps', description: 'Challenges related to software development and IT operations integration.' },
            { challengeCategoryName: 'UI/UX Design', description: 'Challenges focused on user interface and user experience design.' },
            { challengeCategoryName: 'AR/VR Development', description: 'Challenges related to augmented reality and virtual reality applications.' },
            { challengeCategoryName: 'Robotics', description: 'Challenges focused on designing and programming robots.' },
            { challengeCategoryName: 'Game Development', description: 'Challenges related to creating video games.' },
            { challengeCategoryName: 'Open Source Contribution', description: 'Challenges focused on contributing to open source projects.' },
            { challengeCategoryName: 'API Development', description: 'Challenges related to designing and implementing APIs.' },
            { challengeCategoryName: 'E-commerce', description: 'Challenges focused on building e-commerce platforms and solutions.' },
            { challengeCategoryName: 'Social Media', description: 'Challenges related to social media applications and platforms.' },
            { challengeCategoryName: 'Fintech', description: 'Challenges focused on financial technology solutions.' },
            { challengeCategoryName: 'HealthTech', description: 'Challenges related to healthcare technology solutions.' },
            { challengeCategoryName: 'EdTech', description: 'Challenges focused on educational technology solutions.' },
            { challengeCategoryName: 'SaaS', description: 'Challenges related to Software as a Service applications.' },
            { challengeCategoryName: 'AR/VR', description: 'Challenges focused on augmented reality and virtual reality applications.' },
            { challengeCategoryName: 'Chatbot Development', description: 'Challenges related to building chatbots and conversational interfaces.' },
            { challengeCategoryName: 'Natural Language Processing (NLP)', description: 'Challenges focused on processing and analyzing human language.' },
            { challengeCategoryName: 'Computer Vision', description: 'Challenges related to image and video analysis using computer vision techniques.' },
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
