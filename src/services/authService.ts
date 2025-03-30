
import  User  from "../models/userModel";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../utils/helper";
import { sendEmail } from "../utils/emailService";
import logger from '../config/logger';


export class AuthService {

    private frontend_host = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'http://localhost:3000';

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }



}
