import mongoose from 'mongoose';
import User from '../models/userModel'; // Adjust the path if necessary
import bcrypt from "bcryptjs";
import { sendEmail } from '../utils/emailService';
import { generateRandomPassword } from '../utils/helper';
import dotenv from 'dotenv';
dotenv.config();

const { FRONTEND_URL } = process.env;

const seedFirstAdmin = async () => {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umurava-challenge-db-api');

        // Check if an admin already exists
        const existingAdmin = await User.findOne({ userRole: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        // Hash the password
        const admin_password = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(admin_password, 10);

        // Create the first admin user
        const adminUser = new User({
            names: 'Super Admin',
            email: 'zudanga@gmail.com',
            userRole: 'admin',
            profile_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            password: hashedPassword,
            status: 'active',
        });

        // Save the admin user to the database
        await adminUser.save();

        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Super Admin Account Creation',
            name: 'Super Admin',
            message: `Congratulations on becoming the Super Admin of the Rwanda Cooperation Platform! As a Super Admin, you have full access to the system and the ability to manage all aspects of the platform. This includes managing different types of users such as Admins and participants. Additionally, you have the authority to configure various system settings and ensure the platform operates smoothly. 
            Here is your temporary password: ${admin_password}. We highly recommend changing it after logging in for security purposes. 
            Your leadership and oversight are crucial to the success of this platform. If you have any questions or need assistance, feel free to reach out to our support team.
            Thank you for taking on this important role!`,
            link: `${FRONTEND_URL}/login`,
            link_label: 'Log in to your account'
        };

        // Send welcome email
        await sendEmail('send_notification', 'Welcome to Our Platform', adminUser.email, context);
        console.log('First admin user seeded successfully.');
    } catch (error) {
        console.error('Error seeding the first admin user:', error);
    } finally {
        // Disconnect from the database
        await mongoose.disconnect();
    }
};

seedFirstAdmin();