import mongoose from 'mongoose';
import Skill from '../models/skillsModel'; // Adjust the path if necessary ../models/Skill
import dotenv from 'dotenv';
dotenv.config();

const seedSkills = async () => {
    try {
        // Connect to your MongoDB database
          await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://zudanga:a15LoLgUAHKn9Tfv@cluster0.djtfu.mongodb.net/umurava-challenge-db-api?retryWrites=true&w=majority&appName=Cluster0');

        console.log('Connected to the database.');

        // Define the skills to seed
        const skills = [
            { skillName: 'JavaScript', status: 'active' },
            { skillName: 'TypeScript', status: 'active' },
            { skillName: 'Python', status: 'active' },
            { skillName: 'Java', status: 'inactive' },
            { skillName: 'C++', status: 'active' },
        ];

        // Clear existing skills
        await Skill.deleteMany({});
        console.log('Existing skills cleared.');

        // Insert new skills
        await Skill.insertMany(skills);
        console.log('Skills seeded successfully.');

        // Close the database connection
        await mongoose.disconnect();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error seeding skills:', error);
        process.exit(1);
    }
};

seedSkills();