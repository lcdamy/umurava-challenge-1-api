import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import { formatResponse, generateToken, verifyToken } from '../../utils/helper';
import User from '../../models/userModel';
import { sendEmail } from '../../utils/emailService';
import { CreateUserDTO } from '../../dtos/createUserDTO';
import { LogoginUserDTO } from '../../dtos/loginUserDTO';
import { AuthService } from '../../services/authService';
import bcrypt from "bcryptjs";

const { FRONTEND_URL } = process.env;

const authService = new AuthService();

// Controller function for user registration
export const register = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = CreateUserDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during user registration', { errors });
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email: value.email });
        if (existingUser) {
            logger.warn('User already exists', { email: value.email });
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', 'User already exists'));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(value.password, 10);

        // Create and save the new user
        const newUser = new User({ ...value, password: hashedPassword });
        const savedUser = await newUser.save();

        if (!savedUser) {
            logger.error('Error saving user to database', { user: value });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error saving user to database'));
        }

        // Generate a token for email verification
        const token = generateToken({ email: value.email }, 86400);

        // Prepare email context
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Welcome to Our Platform',
            name: value.names,
            message: `Welcome to Umurava Skills Challenge Platform. Click the link below to activate your account.`,
            link: `${FRONTEND_URL}/login?token=${token}`,
            link_label: 'Verify your account'
        };

        // Send welcome email
        await sendEmail('send_notification', 'Welcome to Our Platform', value.email, context);

        logger.info('User registered successfully', { id: savedUser._id });
        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'User registered successfully', { id: savedUser._id }));
    } catch (error) {
        logger.error('Error registering user', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error registering user', error));
    }
};

// Controller function for user login
export const login = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = LogoginUserDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during user login', { errors });
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    const { email, password } = value;

    if (!email || !password) {
        logger.warn('Missing email or password in login request');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Email and password are required'));
    }

    try {
        // Find user by email
        const user = await User.findOne({ email }).select('+password'); // Ensure password is selected
        if (!user) {
            logger.warn('Login failed: user not found', { email });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid email or password'));
        }

        // check if the user is active
        if (user.status === 'inactive') {
            logger.warn('Login failed: user not active', { email });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Your account is inactive. Please verify your email to activate your account.'));
        }

        // Compare passwords
        const isPasswordValid = await authService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            logger.warn('Login failed: invalid password', { email });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid email or password'));
        }

        // Generate token
        const token = generateToken({ id: user._id, email: user.email }, 86400); // 1 day expiration
        logger.info('User logged in successfully', { id: user._id });

        return res.status(StatusCodes.OK).json(formatResponse('success', 'User logged in successfully', { token }));
    } catch (error) {
        logger.error('Error during login', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error logging in user', error));
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.params;
    try {
        // Logic for verifying email using the token
        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            logger.warn('Invalid or expired token', { token });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid or expired token'));
        }

        // Update user status to active
        if (typeof decodedToken !== 'object' || !('email' in decodedToken)) {
            logger.warn('Invalid or expired token', { token });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid or expired token'));
        }

        const user = await User.findOneAndUpdate({ email: decodedToken.email }, { status: 'active' }, { new: true });
        if (!user) {
            logger.warn('User not found for email verification', { email: decodedToken.email });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
        }

        logger.info('Email verified successfully', { id: user._id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Email verified successfully'));
    } catch (error) {
        logger.error('Error verifying email', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error verifying email', error));
    }
};

// Controller function for refreshing access token
// export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
//     const { refreshToken } = req.body;
//     try {
//         // Logic for refreshing access token
//         const newToken = refreshAccessToken(refreshToken);
//         logger.info('Access token refreshed successfully');
//         return res.status(StatusCodes.OK).json(formatResponse('success', 'Access token refreshed successfully', { token: newToken }));
//     } catch (error) {
//         logger.error('Error refreshing access token', { error });
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error refreshing access token', error));
//     }
// };

// Controller function for password reset request
// export const forgetPassword = async (req: Request, res: Response): Promise<Response> => {
//     const { email } = req.body;
//     try {
//         // Logic for handling password reset request
//         const resetToken = await generatePasswordResetToken(email);
//         logger.info('Password reset request successful', { email });
//         return res.status(StatusCodes.OK).json(formatResponse('success', 'Password reset request successful', { resetToken }));
//     } catch (error) {
//         logger.error('Error processing password reset request', { error });
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error processing password reset request', error));
//     }
// };

// Controller function for password reset
// export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
//     const { token, newPassword } = req.body;
//     try {
//         // Logic for resetting password
//         await resetUserPassword(token, newPassword);
//         logger.info('Password reset successfully');
//         return res.status(StatusCodes.OK).json(formatResponse('success', 'Password reset successfully'));
//     } catch (error) {
//         logger.error('Error resetting password', { error });
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error resetting password', error));
//     }
// };

// Controller function for password change
// export const changePassword = async (req: Request, res: Response): Promise<Response> => {
//     const { currentPassword, newPassword } = req.body;
//     try {
//         // Logic for changing password
//         const user = await User.findById(req.user.id);
//         if (!user || !(await user.comparePassword(currentPassword))) {
//             logger.warn('Invalid password change attempt', { id: req.user.id });
//             return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid current password'));
//         }
//         user.password = newPassword;
//         await user.save();
//         logger.info('Password changed successfully', { id: user._id });
//         return res.status(StatusCodes.OK).json(formatResponse('success', 'Password changed successfully'));
//     } catch (error) {
//         logger.error('Error changing password', { error });
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error changing password', error));
//     }
// };

// Controller function for social login
// export const getTokenByEmail = async (req: Request, res: Response): Promise<Response> => {
//     const { email } = req.body;
//     try {
//         // Logic for handling social login
//         const user = await User.findOne({ email });
//         if (!user) {
//             logger.warn('Social login failed: user not found', { email });
//             return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
//         }
//         const token = generateToken(user);
//         logger.info('Social login successful', { id: user._id });
//         return res.status(StatusCodes.OK).json(formatResponse('success', 'Social login successful', { token }));
//     } catch (error) {
//         logger.error('Error processing social login', { error });
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error processing social login', error));
//     }
// };