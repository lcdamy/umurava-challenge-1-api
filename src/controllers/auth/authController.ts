import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import { formatResponse, generateRandomPassword, generateToken, verifyToken } from '../../utils/helper';
import User from '../../models/userModel';
import { sendEmail } from '../../utils/emailService';
import { CreateUserDTO } from '../../dtos/createUserDTO';
import { createAdminDTO } from '../../dtos/createAdminDTO';
import { LoginUserDTO } from '../../dtos/loginUserDTO';
import { ForgetUserDTO } from '../../dtos/forgetUserDTO';
import { ResetUserDTO } from '../../dtos/resetUserDTO';
import { CreateUserSocialDTO } from '../../dtos/createUserSocialDTO';
import { UpdateUserDTO } from '../../dtos/updateUserDTO';
import { UpdateUserPasswordDTO } from '../../dtos/updateUserPasswordDTO';
import { AuthService } from '../../services/authService';
import bcrypt from "bcryptjs";

const { FRONTEND_URL } = process.env;

const authService = new AuthService();

// Controller function for user registration
export const register = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = CreateUserDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during user registration', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
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
            link: `${FRONTEND_URL}/verify-email?token=${token}`,
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

// controller function for admin registration
export const registerAdmin = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = createAdminDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during user registration', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email: value.email });
        if (existingUser) {
            logger.warn('User already exists', { email: value.email });
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', 'User already exists'));
        }

        const adminPassword = generateRandomPassword(12); // Generate a random password for the admin
        // Hash the password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create and save the new user
        const newUser = new User({ ...value, password: hashedPassword, userRole: 'admin', status: 'active' });
        const savedUser = await newUser.save();

        if (!savedUser) {
            logger.error('Error saving user to database', { user: value });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error saving user to database'));
        }


        // Prepare email context
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Welcome to Umurava Skills Challenge Platform',
            name: value.names,
            message: `Congratulations on being added as an Admin to the Umurava Skills Challenge Platform! Your temporary password is: ${adminPassword}. Please click the link below to login to your account, and start managing the platform.`,
            link: `${FRONTEND_URL}/admin/login`,
            link_label: 'Log in to your account'
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
    const { errors, value } = LoginUserDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during user login', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
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
        const token = generateToken({ id: user._id, names: user.names, email: user.email, profile_url: user.profile_url, role: user.userRole }, 86400); // 1 day expiration
        logger.info('User logged in successfully', { id: user._id });

        return res.status(StatusCodes.OK).json(formatResponse('success', 'User logged in successfully', { token }));
    } catch (error) {
        logger.error('Error during login', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error logging in user', error));
    }
};

// Controller function for email verification
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

// Controller function for password reset request
export const forgetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ForgetUserDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during password reset request', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    const { email } = value;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn('Password reset request failed: user not found', { email });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'No account found with the provided email address'));
        }
        //change the status of the user to inactive
        user.status = 'inactive';
        await user.save();

        // Generate a token for password reset
        const token = generateToken({ email: user.email }, 3600); // 1 hour expiration

        // Prepare email context
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Password Reset Request',
            name: user.names,
            message: `You requested a password reset. Click the link below to reset your password.`,
            link: `${FRONTEND_URL}/reset-password?token=${token}`,
            link_label: 'Reset your password'
        };

        // Send password reset email
        await sendEmail('send_notification', 'Password Reset Request', user.email, context);

        logger.info('Password reset request successful', { email });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Password reset request successful', { email }));
    } catch (error) {
        logger.error('Error processing password reset request', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error processing password reset request', error));
    }
};

// Controller function for password reset
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ResetUserDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during password reset', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }

    try {
        // Extract values from the request body
        const { token, newPassword } = value;

        // Verify the token
        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            logger.warn('Invalid or expired token', { token });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid or expired token'));
        }

        // Ensure the token contains the email
        if (typeof decodedToken !== 'object' || !('email' in decodedToken)) {
            logger.warn('Invalid or expired token', { token });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid or expired token'));
        }



        // Find the user by email
        const user = await User.findOne({ email: decodedToken.email });
        if (!user) {
            logger.warn('Password reset failed: user not found');
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and status
        user.password = hashedPassword;
        user.status = 'active'; // Set status to active after password reset
        await user.save();

        logger.info('Password reset successfully', { email: user.email });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Password reset successfully'));
    } catch (error) {
        logger.error('Error resetting password', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error resetting password', error));
    }
};

// Controller function for social login
export const getTokenByEmail = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = CreateUserSocialDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during social login', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }

    const { names, email, profile_url } = value;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user if not found
            const randomPassword = generateRandomPassword(12); // Generate a random password
            const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash the password
            user = new User({ names, email, profile_url, status: 'active', password: hashedPassword, userRole: 'participant' });
            await user.save();
            logger.info('New user created for social login', { id: user._id });
        }
        // Generate token for the user
        const token = generateToken({ id: user._id, names: user.names, email: user.email, profile_url: user.profile_url, role: user.userRole }, 86400); // 1 day expiration
        logger.info('Social login successful', { id: user._id });

        return res.status(user.isNew ? StatusCodes.CREATED : StatusCodes.OK).json(formatResponse('success', 'Social login successful', { token }));
    } catch (error) {
        logger.error('Error processing social login', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error processing social login', error));
    }
};

// Controller function to get user profile
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Get user_id from the request object
        if (!req.user) {
            logger.warn('Unauthorized access attempt');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Unauthorized access'));
        }

        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;

        if (!userId) {
            logger.warn('User ID not found in request object');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'User ID not found'));
        }
        const user = await User.findById(userId).select('-password'); // Exclude password from the response
        if (!user) {
            logger.warn('User not found', { id: userId })// Exclude password from the response });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
        }

        logger.info('User profile retrieved successfully', { id: user._id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'User profile retrieved successfully', req.user));
    } catch (error) {
        logger.error('Error retrieving user profile', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error retrieving user profile', error));
    }
};

// Controller function to update user profile
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        //Get user_id from the request object
        if (!req.user) {
            logger.warn('Unauthorized access attempt');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;

        if (!userId) {
            logger.warn('User ID not found in request object');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'User ID not found'));
        }

        const { errors, value } = UpdateUserDTO.validate(req.body);
        if (errors) {
            logger.warn('Validation error during user profile update', { errors });
            const errorMessages = errors.map((error: any) => error.message).join(', ');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
        }
        // Find the user by ID
        const updatedUser = await User.findByIdAndUpdate(userId, value, { new: true });
        if (!updatedUser) {
            logger.warn('User not found for update', { id: userId });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
        }

        logger.info('User profile updated successfully', { id: updatedUser._id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'User profile updated successfully', updatedUser));
    } catch (error) {
        logger.error('Error updating user profile', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating user profile', error));
    }
};

// Controller function to delete user profile
export const deleteProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        //Get user_id from the request object
        if (!req.user) {
            logger.warn('Unauthorized access attempt');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;

        if (!userId) {
            logger.warn('User ID not found in request object');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'User ID not found'));
        }
        // Find the user by ID and delete
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            logger.warn('User not found for deletion', { id: userId });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
        }

        logger.info('User profile deleted successfully', { id: deletedUser._id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'User profile deleted successfully'));
    } catch (error) {
        logger.error('Error deleting user profile', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting user profile', error));
    }
};

// Controller function to change user password
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = UpdateUserPasswordDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error during password change', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    //Get user_id from the request object
    const { currentPassword, newPassword } = value;
    try {
        //Get user_id from the request object
        if (!req.user) {
            logger.warn('Unauthorized access attempt');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;

        if (!userId) {
            logger.warn('User ID not found in request object');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'User ID not found'));
        }
        const user = await User.findById(userId).select('+password');
        if (!user) {
            logger.warn('User not found for password change', { id: userId });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'User not found'));
        }

        const isPasswordValid = await authService.comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            logger.warn('Invalid current password', { id: userId });
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse('error', 'Invalid current password'));
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        logger.info('Password changed successfully', { id: user._id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Password changed successfully'));
    } catch (error) {
        logger.error('Error changing password', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error changing password', error));
    }
};

// Controller function to get all users
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        //
        const users = await User.find().select('-password');
        logger.info('All users retrieved successfully', { count: users.length });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'All users retrieved successfully', users));
    } catch (error) {
        logger.error('Error retrieving all users', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error retrieving all users', error));
    }
};
