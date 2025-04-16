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