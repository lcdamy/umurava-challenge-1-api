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
const userModel_1 = __importDefault(require("../models/userModel")); // Adjust the path if necessary
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../utils/emailService");
const helper_1 = require("../utils/helper");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { FRONTEND_URL } = process.env;
const seedFirstAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the database
        yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umurava-challenge-db-api');
        // Check if an admin already exists
        const existingAdmin = yield userModel_1.default.findOne({ userRole: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }
        // Hash the password
        const admin_password = (0, helper_1.generateRandomPassword)(12);
        const hashedPassword = yield bcryptjs_1.default.hash(admin_password, 10);
        // Create the first admin user
        const adminUser = new userModel_1.default({
            names: 'Super Admin',
            email: 'zudanga@gmail.com',
            userRole: 'admin',
            profile_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            password: hashedPassword,
            status: 'active',
        });
        // Save the admin user to the database
        yield adminUser.save();
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
        yield (0, emailService_1.sendEmail)('send_notification', 'Welcome to Our Platform', adminUser.email, context);
        console.log('First admin user seeded successfully.');
    }
    catch (error) {
        console.error('Error seeding the first admin user:', error);
    }
    finally {
        // Disconnect from the database
        yield mongoose_1.default.disconnect();
    }
});
seedFirstAdmin();
