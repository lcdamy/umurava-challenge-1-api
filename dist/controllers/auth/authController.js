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
exports.uploadProfilePicture = exports.deactivateAccount = exports.activateAccount = exports.getAllUsers = exports.changePassword = exports.deleteProfile = exports.updateProfile = exports.getProfile = exports.getTokenByEmail = exports.resetPassword = exports.forgetPassword = exports.verifyEmail = exports.login = exports.registerAdmin = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const helper_1 = require("../../utils/helper");
const userModel_1 = __importDefault(require("../../models/userModel"));
const emailService_1 = require("../../utils/emailService");
const createUserDTO_1 = require("../../dtos/createUserDTO");
const createAdminDTO_1 = require("../../dtos/createAdminDTO");
const loginUserDTO_1 = require("../../dtos/loginUserDTO");
const forgetUserDTO_1 = require("../../dtos/forgetUserDTO");
const resetUserDTO_1 = require("../../dtos/resetUserDTO");
const createUserSocialDTO_1 = require("../../dtos/createUserSocialDTO");
const updateUserDTO_1 = require("../../dtos/updateUserDTO");
const updateUserPasswordDTO_1 = require("../../dtos/updateUserPasswordDTO");
const authService_1 = require("../../services/authService");
const notificationService_1 = require("../../services/notificationService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const { FRONTEND_URL } = process.env;
const authService = new authService_1.AuthService();
const notificationService = new notificationService_1.NoticationSercice();
// Controller function for user registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = createUserDTO_1.CreateUserDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during user registration', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        // Check if the user already exists
        const existingUser = yield userModel_1.default.findOne({ email: value.email });
        if (existingUser) {
            logger_1.default.warn('User already exists', { email: value.email });
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)('error', 'User already exists'));
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(value.password, 10);
        // Create and save the new user
        const newUser = new userModel_1.default(Object.assign(Object.assign({}, value), { password: hashedPassword }));
        const savedUser = yield newUser.save();
        if (!savedUser) {
            logger_1.default.error('Error saving user to database', { user: value });
            return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error saving user to database'));
        }
        // Generate a token for email verification
        const token = (0, helper_1.generateToken)({ email: value.email }, 86400);
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
        yield (0, emailService_1.sendEmail)('send_notification', 'Welcome to Our Platform', value.email, context);
        // Notify each active admin
        const admins = yield userModel_1.default.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'New User Registration',
                    message: `A new user, ${value.names}, has registered on the platform with the email ${value.email}. Please review their details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                yield notificationService.createNotification(notification);
            }
        }
        logger_1.default.info('User registered successfully', { id: savedUser._id });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)('success', 'User registered successfully', { id: savedUser._id }));
    }
    catch (error) {
        logger_1.default.error('Error registering user', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error registering user', error));
    }
});
exports.register = register;
// controller function for admin registration
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = createAdminDTO_1.createAdminDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during user registration', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        // Check if the user already exists
        const existingUser = yield userModel_1.default.findOne({ email: value.email });
        if (existingUser) {
            logger_1.default.warn('User already exists', { email: value.email });
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)('error', 'User already exists'));
        }
        const adminPassword = (0, helper_1.generateRandomPassword)(12); // Generate a random password for the admin
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(adminPassword, 10);
        // Create and save the new user
        const newUser = new userModel_1.default(Object.assign(Object.assign({}, value), { password: hashedPassword, userRole: 'admin', status: 'active' }));
        const savedUser = yield newUser.save();
        // Create notification for each active admin except the one who registered
        const admins = yield userModel_1.default.find({ userRole: 'admin', status: 'active', email: { $ne: value.email } });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'New Admin Registration',
                    message: `A new admin, ${value.names}, has been registered on the platform with the email ${value.email}. Please review their details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                yield notificationService.createNotification(notification);
            }
        }
        if (!savedUser) {
            logger_1.default.error('Error saving user to database', { user: value });
            return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error saving user to database'));
        }
        // Prepare email context
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Welcome to Umurava Skills Challenge Platform',
            name: value.names,
            message: `Congratulations on being added as an Admin to the Umurava Skills Challenge Platform! Your temporary password is: ${adminPassword}. Please click the link below to login to your account, and start managing the platform.`,
            link: `${FRONTEND_URL}/login`,
            link_label: 'Log in to your account'
        };
        // Send welcome email
        yield (0, emailService_1.sendEmail)('send_notification', 'Welcome to Our Platform', value.email, context);
        logger_1.default.info('User registered successfully', { id: savedUser._id });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)('success', 'User registered successfully', { id: savedUser._id }));
    }
    catch (error) {
        logger_1.default.error('Error registering user', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error registering user', error));
    }
});
exports.registerAdmin = registerAdmin;
// Controller function for user login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = loginUserDTO_1.LoginUserDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during user login', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    const { email, password } = value;
    if (!email || !password) {
        logger_1.default.warn('Missing email or password in login request');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Email and password are required'));
    }
    try {
        // Find user by email
        const user = yield userModel_1.default.findOne({ email }).select('+password'); // Ensure password is selected
        if (!user) {
            logger_1.default.warn('Login failed: user not found', { email });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid email or password'));
        }
        // check if the user is active
        if (user.status === 'inactive') {
            logger_1.default.warn('Login failed: user not active', { email });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Your account is inactive. Please verify your email to activate your account.'));
        }
        // check if the user is deleted
        if (user.status === 'slept') {
            logger_1.default.warn('Login failed: user not active', { email });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Your account has been deleted. Please contact support for assistance.'));
        }
        // Compare passwords
        const isPasswordValid = yield authService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            logger_1.default.warn('Login failed: invalid password', { email });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid email or password'));
        }
        // Generate token
        const token = (0, helper_1.generateToken)({ id: user._id, names: user.names, email: user.email, profile_url: user.profile_url, role: user.userRole }, 86400); // 1 day expiration
        logger_1.default.info('User logged in successfully', { id: user._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'User logged in successfully', { token }));
    }
    catch (error) {
        logger_1.default.error('Error during login', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error logging in user', error));
    }
});
exports.login = login;
// Controller function for email verification
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        // Logic for verifying email using the token
        const decodedToken = (0, helper_1.verifyToken)(token);
        if (!decodedToken) {
            logger_1.default.warn('Invalid or expired token', { token });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid or expired token'));
        }
        // Update user status to active
        if (typeof decodedToken !== 'object' || !('email' in decodedToken)) {
            logger_1.default.warn('Invalid or expired token', { token });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid or expired token'));
        }
        const user = yield userModel_1.default.findOneAndUpdate({ email: decodedToken.email }, { status: 'active' }, { new: true });
        if (!user) {
            logger_1.default.warn('User not found for email verification', { email: decodedToken.email });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        logger_1.default.info('Email verified successfully', { id: user._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Email verified successfully'));
    }
    catch (error) {
        logger_1.default.error('Error verifying email', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error verifying email', error));
    }
});
exports.verifyEmail = verifyEmail;
// Controller function for password reset request
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = forgetUserDTO_1.ForgetUserDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during password reset request', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    const { email } = value;
    try {
        // Check if the user exists
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            logger_1.default.warn('Password reset request failed: user not found', { email });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'No account found with the provided email address'));
        }
        //change the status of the user to inactive
        user.status = 'inactive';
        yield user.save();
        // Generate a token for password reset
        const token = (0, helper_1.generateToken)({ email: user.email }, 3600); // 1 hour expiration
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
        yield (0, emailService_1.sendEmail)('send_notification', 'Password Reset Request', user.email, context);
        logger_1.default.info('Password reset request successful', { email });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Password reset request successful', { email }));
    }
    catch (error) {
        logger_1.default.error('Error processing password reset request', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error processing password reset request', error));
    }
});
exports.forgetPassword = forgetPassword;
// Controller function for password reset
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = resetUserDTO_1.ResetUserDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during password reset', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        // Extract values from the request body
        const { token, newPassword } = value;
        // Verify the token
        const decodedToken = (0, helper_1.verifyToken)(token);
        if (!decodedToken) {
            logger_1.default.warn('Invalid or expired token', { token });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid or expired token'));
        }
        // Ensure the token contains the email
        if (typeof decodedToken !== 'object' || !('email' in decodedToken)) {
            logger_1.default.warn('Invalid or expired token', { token });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid or expired token'));
        }
        // Find the user by email
        const user = yield userModel_1.default.findOne({ email: decodedToken.email });
        if (!user) {
            logger_1.default.warn('Password reset failed: user not found');
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        // Hash the new password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        // Update the user's password and status
        user.password = hashedPassword;
        user.status = 'active'; // Set status to active after password reset
        yield user.save();
        logger_1.default.info('Password reset successfully', { email: user.email });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Password reset successfully'));
    }
    catch (error) {
        logger_1.default.error('Error resetting password', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error resetting password', error));
    }
});
exports.resetPassword = resetPassword;
// Controller function for social login
const getTokenByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = createUserSocialDTO_1.CreateUserSocialDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during social login', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    const { names, email, profile_url } = value;
    try {
        let user = yield userModel_1.default.findOne({ email });
        if (!user) {
            // Create a new user if not found
            const randomPassword = (0, helper_1.generateRandomPassword)(12); // Generate a random password
            const hashedPassword = yield bcryptjs_1.default.hash(randomPassword, 10); // Hash the password
            user = new userModel_1.default({ names, email, profile_url, status: 'active', password: hashedPassword, userRole: 'participant' });
            yield user.save();
            logger_1.default.info('New user created for social login', { id: user._id });
        }
        if (user.status === 'slept') {
            logger_1.default.warn('Login failed: user not active', { email });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Your account has been deleted. Please contact support for assistance.'));
        }
        // Generate token for the user
        const token = (0, helper_1.generateToken)({ id: user._id, names: user.names, email: user.email, profile_url: user.profile_url, role: user.userRole }, 86400); // 1 day expiration
        logger_1.default.info('Social login successful', { id: user._id });
        return res.status(user.isNew ? http_status_codes_1.StatusCodes.CREATED : http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Social login successful', { token }));
    }
    catch (error) {
        logger_1.default.error('Error processing social login', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error processing social login', error));
    }
});
exports.getTokenByEmail = getTokenByEmail;
// Controller function to get user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user_id from the request object
        if (!req.user) {
            logger_1.default.warn('Unauthorized access attempt');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request object');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'User ID not found'));
        }
        const user = yield userModel_1.default.findById(userId).select('-password'); // Exclude password from the response
        if (!user) {
            logger_1.default.warn('User not found', { id: userId }); // Exclude password from the response });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        logger_1.default.info('User profile retrieved successfully', { id: user._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'User profile retrieved successfully', req.user));
    }
    catch (error) {
        logger_1.default.error('Error retrieving user profile', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error retrieving user profile', error));
    }
});
exports.getProfile = getProfile;
// Controller function to update user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get user_id from the request object
        if (!req.user) {
            logger_1.default.warn('Unauthorized access attempt');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request object');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'User ID not found'));
        }
        const { errors, value } = updateUserDTO_1.UpdateUserDTO.validate(req.body);
        if (errors) {
            logger_1.default.warn('Validation error during user profile update', { errors });
            const errorMessages = errors.map((error) => error.message).join(', ');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
        }
        // Find the user by ID
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, value, { new: true });
        if (!updatedUser) {
            logger_1.default.warn('User not found for update', { id: userId });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        logger_1.default.info('User profile updated successfully', { id: updatedUser._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'User profile updated successfully', updatedUser));
    }
    catch (error) {
        logger_1.default.error('Error updating user profile', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error updating user profile', error));
    }
});
exports.updateProfile = updateProfile;
// Controller function to delete user profile
const deleteProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get user_id from the request object
        if (!req.user) {
            logger_1.default.warn('Unauthorized access attempt');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request object');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'User ID not found'));
        }
        // Find the user by ID and update the status to 'slept'
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { status: 'slept' }, { new: true });
        if (!updatedUser) {
            logger_1.default.warn('User not found for status update', { id: userId });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        //send notification to all active admins
        const admins = yield userModel_1.default.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'User Profile Deletion',
                    message: `The user ${updatedUser.names} (${updatedUser.email}) has deleted their profile. Please review this action if necessary.`,
                    userId: admin._id,
                    status: 'unread'
                };
                yield notificationService.createNotification(notification);
            }
        }
        // Delete the user from the database
        logger_1.default.info('User profile deleted successfully', { id: updatedUser._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'User profile deleted successfully'));
    }
    catch (error) {
        logger_1.default.error('Error deleting user profile', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error deleting user profile', error));
    }
});
exports.deleteProfile = deleteProfile;
// Controller function to change user password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = updateUserPasswordDTO_1.UpdateUserPasswordDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during password change', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    //Get user_id from the request object
    const { currentPassword, newPassword } = value;
    try {
        //Get user_id from the request object
        if (!req.user) {
            logger_1.default.warn('Unauthorized access attempt');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Unauthorized access'));
        }
        // Find the user by ID
        const userId = (req.user && 'id' in req.user) ? req.user.id : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request object');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'User ID not found'));
        }
        const user = yield userModel_1.default.findById(userId).select('+password');
        if (!user) {
            logger_1.default.warn('User not found for password change', { id: userId });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        const isPasswordValid = yield authService.comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            logger_1.default.warn('Invalid current password', { id: userId });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid current password'));
        }
        user.password = yield bcryptjs_1.default.hash(newPassword, 10);
        yield user.save();
        logger_1.default.info('Password changed successfully', { id: user._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Password changed successfully'));
    }
    catch (error) {
        logger_1.default.error('Error changing password', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error changing password', error));
    }
});
exports.changePassword = changePassword;
// Controller function to get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1); // Ensure page is at least 1
        const limit = Math.max(1, parseInt(req.query.limit) || 10); // Ensure limit is at least 1
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString().trim().toLowerCase()) || '';
        // Extract filters from query parameters, excluding pagination and search
        const filters = Object.entries(req.query)
            .filter(([key]) => !['page', 'limit', 'search'].includes(key))
            .reduce((acc, [key, value]) => (Object.assign(Object.assign({}, acc), { [key]: value })), {});
        const query = Object.assign(Object.assign({}, filters), (search && { $or: [{ names: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }));
        const [users, total] = yield Promise.all([
            userModel_1.default.find(query)
                .select('-password') // Exclude password field
                .skip((page - 1) * limit)
                .limit(limit),
            userModel_1.default.countDocuments(query),
        ]);
        const paginatedData = {
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                pageSize: limit,
                totalItems: total,
            },
        };
        logger_1.default.info('All users retrieved successfully', { count: users.length });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'All users retrieved successfully', paginatedData));
    }
    catch (error) {
        logger_1.default.error('Error retrieving all users', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error retrieving all users', error));
    }
});
exports.getAllUsers = getAllUsers;
const activateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate the ID format (if necessary)
        if (!id) {
            logger_1.default.warn('User ID is required for activation');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'User ID is required'));
        }
        // Find the user by ID and update the status to 'active'
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(id, { status: 'active' }, { new: true });
        if (!updatedUser) {
            logger_1.default.warn('User not found for activation', id);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        logger_1.default.info('Account activated successfully', { id: updatedUser._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Account activated successfully'));
    }
    catch (error) {
        logger_1.default.error('Error activating account', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error activating account', error));
    }
});
exports.activateAccount = activateAccount;
const deactivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate the ID format (if necessary)
        if (!id) {
            logger_1.default.warn('User ID is required for deactivation');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'User ID is required'));
        }
        // Find the user by ID and update the status to 'inactive'
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
        if (!updatedUser) {
            logger_1.default.warn('User not found for deactivation', id);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        logger_1.default.info('Account deactivated successfully', { id: updatedUser._id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Account deactivated successfully'));
    }
    catch (error) {
        logger_1.default.error('Error deactivating account', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error deactivating account', error));
    }
});
exports.deactivateAccount = deactivateAccount;
//import expert user using multer and xlsx
const uploadProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the file type and size using Joi
        const schema = joi_1.default.object({
            file: joi_1.default.object().required(),
        });
        const { error } = schema.validate({ file: req.file });
        if (error) {
            logger_1.default.warn('Validation error during file upload', { error });
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Invalid file type or size'));
        }
        // Check if the file is provided
        if (!req.file) {
            logger_1.default.warn('No file uploaded');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'No file uploaded'));
        }
        // Check if the user is authenticated
        if (!req.user || !('id' in req.user)) {
            logger_1.default.warn('Unauthorized access attempt');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Unauthorized access'));
        }
        const userId = req.user.id;
        // Upload the file using the authService
        const fileUrl = yield authService.uploadFile(req.file);
        // Update the user's profile_url with the uploaded file URL
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { profile_url: fileUrl }, { new: true });
        if (!updatedUser) {
            logger_1.default.warn('User not found for profile picture update', { id: userId });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'User not found'));
        }
        logger_1.default.info('Profile picture uploaded successfully', { file_url: fileUrl });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Profile picture uploaded successfully', { file_url: fileUrl }));
    }
    catch (error) {
        logger_1.default.error('Error uploading profile picture', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error uploading profile picture', error));
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
