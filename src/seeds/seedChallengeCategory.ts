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
            { challengeCategoryName: 'Web development', description: 'Challenges related to building and maintaining websites and web applications.' },
            { challengeCategoryName: 'Mobile development', description: 'Challenges focused on creating applications for mobile devices.' },
            { challengeCategoryName: 'Data science', description: 'Challenges involving data analysis, machine learning, and statistical modeling.' },
            { challengeCategoryName: 'Game development', description: 'Challenges related to designing and developing video games.' },
            { challengeCategoryName: 'Artificial Intelligence', description: 'Challenges involving AI algorithms, models, and applications.' },
            { challengeCategoryName: 'Blockchain', description: 'Challenges related to blockchain technology and decentralized applications.' },
            { challengeCategoryName: 'Internet of Things (IoT)', description: 'Challenges focused on IoT devices and applications.' },
            { challengeCategoryName: 'DevOps', description: 'Challenges related to software development and IT operations integration.' },
            { challengeCategoryName: 'UI/UX Design', description: 'Challenges focused on user interface and user experience design.' },
            { challengeCategoryName: 'AR/VR Development', description: 'Challenges related to augmented reality and virtual reality applications.' },
            { challengeCategoryName: 'Robotics', description: 'Challenges focused on designing and programming robots.' },
            { challengeCategoryName: 'Game Development', description: 'Challenges related to creating video games.' }
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