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
exports.getTokenByEmail = exports.resetPassword = exports.forgetPassword = exports.verifyEmail = exports.login = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const helper_1 = require("../../utils/helper");
const userModel_1 = __importDefault(require("../../models/userModel"));
const emailService_1 = require("../../utils/emailService");
const createUserDTO_1 = require("../../dtos/createUserDTO");
const loginUserDTO_1 = require("../../dtos/loginUserDTO");
const forgetUserDTO_1 = require("../../dtos/forgetUserDTO");
const resetUserDTO_1 = require("../../dtos/resetUserDTO");
const createUserSocialDTO_1 = require("../../dtos/createUserSocialDTO");
const authService_1 = require("../../services/authService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const { FRONTEND_URL } = process.env;
const authService = new authService_1.AuthService();
// Controller function for user registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = createUserDTO_1.CreateUserDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during user registration', { errors });
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
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
            link: `${FRONTEND_URL}/login?token=${token}`,
            link_label: 'Verify your account'
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
exports.register = register;
// Controller function for user login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = loginUserDTO_1.LoginUserDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error during user login', { errors });
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
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
        // Compare passwords
        const isPasswordValid = yield authService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            logger_1.default.warn('Login failed: invalid password', { email });
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)('error', 'Invalid email or password'));
        }
        // Generate token
        const token = (0, helper_1.generateToken)({ id: user._id, email: user.email, profile_url: user.profile_url }, 86400); // 1 day expiration
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
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
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
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
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
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
    }
    const { names, email, profile_url } = value;
    try {
        let user = yield userModel_1.default.findOne({ email });
        if (!user) {
            // Create a new user if not found
            user = new userModel_1.default({ names, email, profile_url, status: 'active' });
            yield user.save();
            logger_1.default.info('New user created for social login', { id: user._id });
        }
        // Generate token for the user
        const token = (0, helper_1.generateToken)({ id: user._id, email: user.email, profile_url: user.profile_url }, 86400); // 1 day expiration
        logger_1.default.info('Social login successful', { id: user._id });
        return res.status(user.isNew ? http_status_codes_1.StatusCodes.CREATED : http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Social login successful', { token }));
    }
    catch (error) {
        logger_1.default.error('Error processing social login', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error processing social login', error));
    }
});
exports.getTokenByEmail = getTokenByEmail;
