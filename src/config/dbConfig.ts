import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umurava-challenge-db', {});
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error during database connection: ${JSON.stringify(error) || error}`);
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
};

export default connectDB;