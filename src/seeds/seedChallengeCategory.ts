import mongoose from 'mongoose';
import seedChallengeCategory from '../models/challengeCategoryModel'; // Adjust the path if necessary ../models/seedChallengeCategory
import dotenv from 'dotenv';
dotenv.config();

const seedseedChallengeCategorys = async () => {
    try {
        // Connect to your MongoDB database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://zudanga:a15LoLgUAHKn9Tfv@cluster0.djtfu.mongodb.net/umurava-challenge-db-api?retryWrites=true&w=majority&appName=Cluster0');

        console.log('Connected to the database.');

        // Define the challengeCategory to seed
        const challengeCategory = [
            { challengeCategoryName: 'Tech & IT', description: 'Challenges related to technology and information technology.' },
            { challengeCategoryName: 'Data & AI', description: 'Challenges related to data analysis, artificial intelligence, and machine learning.' },
            { challengeCategoryName: 'Digital Marketing & Communications', description: 'Challenges related to online marketing, branding, and communication strategies.' },
            { challengeCategoryName: 'Digital Creative & Content Production', description: 'Challenges related to creating digital content and creative production.' }
        ];

        // Clear existing challengeCategory
        await seedChallengeCategory.deleteMany({});
        console.log('Existing challengeCategory cleared.');

        // Insert new challengeCategory
        await seedChallengeCategory.insertMany(challengeCategory);
        console.log('seedChallengeCategorys seeded successfully.');

        // Close the database connection
        await mongoose.disconnect();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error seeding challengeCategory:', error);
        process.exit(1);
    }
};

seedseedChallengeCategorys();