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
const prizesModel_1 = __importDefault(require("../models/prizesModel")); // Adjust the path if necessary ../models/Prize
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedPrizes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to your MongoDB database
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umurava-challenge-db-api');
        console.log('Connected to the database.');
        // Define the prizes to seed
        const prizes = [
            { prizeName: 'First Runner', description: 'Awarded to the first runner-up in the competition.' },
            { prizeName: 'Second Runner', description: 'Awarded to the second runner-up in the competition.' },
            { prizeName: 'Third Runner', description: 'Awarded to the third runner-up in the competition.' },
            { prizeName: 'Best Performance', description: 'Awarded for the best performance in the competition.' },
            { prizeName: 'Most Innovative', description: 'Awarded for the most innovative solution.' },
            { prizeName: 'Best Teamwork', description: 'Awarded for the best teamwork displayed during the competition.' },
            { prizeName: 'Best Presentation', description: 'Awarded for the best presentation of ideas.' },
        ];
        // Clear existing prizes
        yield prizesModel_1.default.deleteMany({});
        console.log('Existing prizes cleared.');
        // Insert new prizes
        yield prizesModel_1.default.insertMany(prizes);
        console.log('Prizes seeded successfully.');
        // Close the database connection
        yield mongoose_1.default.disconnect();
        console.log('Database connection closed.');
    }
    catch (error) {
        console.error('Error seeding prizes:', error);
        process.exit(1);
    }
});
seedPrizes();
