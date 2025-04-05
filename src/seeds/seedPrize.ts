import mongoose from 'mongoose';
import Prize from '../models/prizesModel'; // Adjust the path if necessary ../models/Prize
import dotenv from 'dotenv';
dotenv.config();

const seedPrizes = async () => {
    try {
        // Connect to your MongoDB database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://zudanga:a15LoLgUAHKn9Tfv@cluster0.djtfu.mongodb.net/umurava-challenge-db-api?retryWrites=true&w=majority&appName=Cluster0');

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
        await Prize.deleteMany({});
        console.log('Existing prizes cleared.');

        // Insert new prizes
        await Prize.insertMany(prizes);
        console.log('Prizes seeded successfully.');

        // Close the database connection
        await mongoose.disconnect();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error seeding prizes:', error);
        process.exit(1);
    }
};

seedPrizes();