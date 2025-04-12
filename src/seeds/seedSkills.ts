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
            { skillName: 'Ruby', status: 'inactive' },
            { skillName: 'Go', status: 'active' },
            { skillName: 'PHP', status: 'active' },
            { skillName: 'Swift', status: 'inactive' },
            { skillName: 'Kotlin', status: 'active' },
            { skillName: 'C#', status: 'inactive' },
            { skillName: 'Rust', status: 'active' },
            { skillName: 'Dart', status: 'active' },
            { skillName: 'Scala', status: 'inactive' },
            { skillName: 'Shell Scripting', status: 'active' },
            { skillName: 'SQL', status: 'active' },
            { skillName: 'NoSQL', status: 'inactive' },
            { skillName: 'HTML', status: 'active' },
            { skillName: 'CSS', status: 'active' },
            { skillName: 'React', status: 'active' },
            { skillName: 'Angular', status: 'inactive' },
            { skillName: 'Vue.js', status: 'active' },
            { skillName: 'Node.js', status: 'active' },
            { skillName: 'Express.js', status: 'inactive' },
            { skillName: 'GraphQL', status: 'active' },
            { skillName: 'RESTful APIs', status: 'active' },
            { skillName: 'Docker', status: 'inactive' },
            { skillName: 'Kubernetes', status: 'active' },
            { skillName: 'AWS', status: 'active' },
            { skillName: 'Azure', status: 'inactive' },
            { skillName: 'Google Cloud', status: 'active' },
            { skillName: 'Firebase', status: 'inactive' },
            { skillName: 'Machine Learning', status: 'active' },
            { skillName: 'Data Science', status: 'active' },
            { skillName: 'DevOps', status: 'inactive' },
            { skillName: 'Agile Methodologies', status: 'active' },
            { skillName: 'Scrum', status: 'inactive' },
            { skillName: 'Kanban', status: 'active' },
            { skillName: 'Project Management', status: 'active' },
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