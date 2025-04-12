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
exports.getWebsiteData = exports.removeNewsletter = exports.joinNewsletter = exports.unreadAllNotifications = exports.readAllNotifications = exports.deleteAllNotifications = exports.deleteNotification = exports.unreadUpdateNotification = exports.updateNotification = exports.getAllNotifications = exports.createNotification = exports.joinWhatsAppCommunity = exports.joinProgram = exports.getWelcomeMessage = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../../utils/helper");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const subscribersModel_1 = __importDefault(require("../../models/subscribersModel"));
const notificationService_1 = require("../../services/notificationService");
const userService_1 = require("../../services/userService");
const JoinProgramDTO = require('../../dtos/joinProgramDTO');
const JoinCommunityDTO = require('../../dtos/joinCommunityDTO');
const createNotificationDTO = require('../../dtos/createNotificationDTO');
const qrcode = require("qrcode-terminal");
const webSocketHandler_1 = __importDefault(require("../../websocket/webSocketHandler")); // Adjust the path as needed
const http_1 = require("http"); // Ensure this import exists if not already present
const server = new http_1.Server(); // Replace with your actual server instance
const webSocketHandlerInstance = new webSocketHandler_1.default(server);
const notificationService = new notificationService_1.NoticationSercice(webSocketHandlerInstance);
const userSercice = new userService_1.UserSercice();
// Get all skills
const getWelcomeMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Fetching welcome message');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Welcome to Umurava Challenge API!"));
    }
    catch (error) {
        logger_1.default.error('Error fetching welcome message', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error fetching welcome message", error));
    }
});
exports.getWelcomeMessage = getWelcomeMessage;
// Join the program
const joinProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = JoinProgramDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error in joinProgram', { errors });
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Validation Error", errors));
    }
    try {
        const SECRET_KEY = process.env.TOKEN_SECRET;
        if (!SECRET_KEY) {
            logger_1.default.error('Token secret is not defined');
            return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Token secret is not defined"));
        }
        const token = jsonwebtoken_1.default.sign(value, SECRET_KEY, { expiresIn: '1d', algorithm: 'HS256' });
        let user;
        if (value.userRole === 'admin')
            user = yield userModel_1.default.findOne({ userRole: value.userRole });
        if (value.userRole === 'participant')
            user = yield userModel_1.default.findOne({ userRole: value.userRole });
        logger_1.default.info('Token created successfully', { user, token });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)('success', 'Token for entering the program created', { user, token }));
    }
    catch (error) {
        logger_1.default.error('Error creating token', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error creating token", error));
    }
});
exports.joinProgram = joinProgram;
// Join WhatsApp community using whatsapp-web.js
const joinWhatsAppCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = JoinCommunityDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error in joinWhatsAppCommunity', { errors });
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Validation Error", errors));
    }
    const client = new whatsapp_web_js_1.Client({ authStrategy: new whatsapp_web_js_1.LocalAuth() });
    client.on('qr', (qr) => {
        logger_1.default.info('QR code received for WhatsApp authentication');
        qrcode.generate(qr, { small: true });
    });
    client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const inviteLink = process.env.COMMUNITY_INVITE_LINK;
            if (!inviteLink) {
                logger_1.default.error('Community invite link is not defined');
                return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Community invite link is not defined"));
            }
            const chatId = `${value.phoneNumber}@c.us`;
            yield client.sendMessage(chatId, `Welcome to the Umurava Challenge WhatsApp community! Join our community: ${inviteLink}`);
            logger_1.default.info('Message sent to WhatsApp member', { chatId });
            return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Message sent to WhatsApp member"));
        }
        catch (error) {
            logger_1.default.error('Error sending message to WhatsApp member', { error });
            return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error sending message to WhatsApp member", error));
        }
        finally {
            client.destroy();
        }
    }));
    client.on('auth_failure', (msg) => {
        logger_1.default.error('Authentication failure', { msg });
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)("error", "Authentication failure", msg));
    });
    client.on('disconnected', (reason) => {
        logger_1.default.info('Client was logged out', { reason });
    });
    logger_1.default.info('Initializing WhatsApp client');
    client.initialize();
});
exports.joinWhatsAppCommunity = joinWhatsAppCommunity;
// Create a notification
const createNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { errors, value } = createNotificationDTO.validate(req.body);
        if (errors) {
            logger_1.default.warn('Validation error in createNotification', { errors });
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Validation Error", errors));
        }
        const notification = yield notificationService.createNotification(value);
        logger_1.default.info('Notification created successfully', { notification });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)("success", "Notification created successfully", notification));
    }
    catch (error) {
        logger_1.default.error('Error creating notification', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error creating notification", error));
    }
});
exports.createNotification = createNotification;
// get notifications
const getAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            logger_1.default.warn('User is not authenticated');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "User ID not found in request"));
        }
        logger_1.default.info('Fetching notifications for user', { userId });
        const { status } = req.query; // Read status from query parameters
        const filters = { userId };
        if (status) {
            if (status !== 'read' && status !== 'unread') {
                logger_1.default.warn('Invalid status filter provided', { status });
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Invalid status filter. Allowed values are 'read' or 'unread'"));
            }
            filters.status = status;
        }
        logger_1.default.info('Filters for fetching notifications', { filters });
        const notifications = yield notificationService.getAllNotifications(filters);
        if (!notifications) {
            logger_1.default.warn('No notifications found for user', { userId });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)("error", "No notifications found for user"));
        }
        logger_1.default.info('Notifications fetched successfully', { userId, status });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Notifications fetched successfully", notifications));
    }
    catch (error) {
        logger_1.default.error('Error fetching notifications', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error fetching notifications", error));
    }
});
exports.getAllNotifications = getAllNotifications;
// Update a notification
const updateNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            logger_1.default.warn('Notification ID not provided');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Notification ID not provided"));
        }
        const existingNotification = yield notificationService.getNotificationById(id);
        logger_1.default.info('Existing notification fetched', { existingNotification });
        if (!existingNotification) {
            logger_1.default.warn('Notification not found', { id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)("error", "Notification not found"));
        }
        const updatedNotification = yield notificationService.updateNotification(id, 'read');
        logger_1.default.info('Notification updated successfully', { updatedNotification });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Notification updated successfully", updatedNotification));
    }
    catch (error) {
        logger_1.default.error('Error updating notification in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error updating notification", error));
    }
});
exports.updateNotification = updateNotification;
// Update a notification
const unreadUpdateNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            logger_1.default.warn('Notification ID not provided');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Notification ID not provided"));
        }
        const existingNotification = yield notificationService.getNotificationById(id);
        logger_1.default.info('Existing notification fetched', { existingNotification });
        if (!existingNotification) {
            logger_1.default.warn('Notification not found', { id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)("error", "Notification not found"));
        }
        const updatedNotification = yield notificationService.updateNotification(id, 'unread');
        logger_1.default.info('Notification updated successfully', { updatedNotification });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Notification updated successfully", updatedNotification));
    }
    catch (error) {
        logger_1.default.error('Error updating notification in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error updating notification", error));
    }
});
exports.unreadUpdateNotification = unreadUpdateNotification;
// Delete a notification
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            logger_1.default.warn('Notification ID not provided');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Notification ID not provided"));
        }
        const existingNotification = yield notificationService.getNotificationById(id);
        if (!existingNotification) {
            logger_1.default.warn('Notification not found', { id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)("error", "Notification not found"));
        }
        logger_1.default.info('Existing notification fetched', { existingNotification });
        const notification = yield notificationService.deleteNotification(id);
        logger_1.default.info('Notification deleted successfully', { notification });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Notification deleted successfully", notification));
    }
    catch (error) {
        logger_1.default.error('Error deleting notification  in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error deleting notification", error));
    }
});
exports.deleteNotification = deleteNotification;
// Delete all notifications for a user
const deleteAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            logger_1.default.warn('User is not authenticated');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "User ID not found in request"));
        }
        logger_1.default.info('Deleting all notifications for user', { userId });
        const deletedNotifications = yield notificationService.deleteAllNotifications(userId);
        logger_1.default.info('All notifications deleted successfully', { userId });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "All notifications deleted successfully", deletedNotifications));
    }
    catch (error) {
        logger_1.default.error('Error deleting all notifications  in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error deleting all notifications", error));
    }
});
exports.deleteAllNotifications = deleteAllNotifications;
//Read all notifications for a user
const readAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            logger_1.default.warn('User is not authenticated');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "User ID not found in request"));
        }
        logger_1.default.info('Reading all notifications for user', { userId });
        const readNotifications = yield notificationService.readAllNotifications(userId);
        logger_1.default.info('All notifications marked as read successfully', { userId });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "All notifications marked as read successfully", readNotifications));
    }
    catch (error) {
        logger_1.default.error('Error marking all notifications as read  in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error marking all notifications as read", error));
    }
});
exports.readAllNotifications = readAllNotifications;
const unreadAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            logger_1.default.warn('User is not authenticated');
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_1.formatResponse)("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;
        if (!userId) {
            logger_1.default.warn('User ID not found in request');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "User ID not found in request"));
        }
        logger_1.default.info('Reading all notifications for user', { userId });
        const readNotifications = yield notificationService.unreadAllNotifications(userId);
        logger_1.default.info('All notifications marked as read successfully', { userId });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "All notifications marked as read successfully", readNotifications));
    }
    catch (error) {
        logger_1.default.error('Error marking all notifications as read  in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error marking all notifications as read", error));
    }
});
exports.unreadAllNotifications = unreadAllNotifications;
// Join newsletter
const joinNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        logger_1.default.warn('Email not provided for newsletter subscription');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Email is required"));
    }
    try {
        // Logic to add the email to the newsletter subscription list
        const existingSubscriber = yield subscribersModel_1.default.findOne({ email });
        if (existingSubscriber) {
            logger_1.default.warn('Email already subscribed to the newsletter', { email });
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)("error", "Email already subscribed to the newsletter"));
        }
        const newSubscriber = new subscribersModel_1.default({ email, status: 'active' });
        yield newSubscriber.save();
        logger_1.default.info('New subscriber added to the newsletter', { email });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Successfully subscribed to the newsletter"));
    }
    catch (error) {
        logger_1.default.error('Error subscribing to newsletter', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error subscribing to the newsletter", error));
    }
});
exports.joinNewsletter = joinNewsletter;
// Unsubscribe from newsletter
const removeNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        logger_1.default.warn('Email not provided for newsletter unsubscription');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Email is required"));
    }
    try {
        const existingSubscriber = yield subscribersModel_1.default.findOne({ email });
        if (!existingSubscriber) {
            logger_1.default.warn('Email not found in the newsletter subscription list', { email });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)("error", "Email not found in the newsletter subscription list"));
        }
        yield subscribersModel_1.default.updateOne({ email }, { status: 'inactive' });
        logger_1.default.info('Subscriber status updated to inactive in the newsletter', { email });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Successfully unsubscribed from the newsletter"));
    }
    catch (error) {
        logger_1.default.error('Error unsubscribing from newsletter', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error unsubscribing from the newsletter", error));
    }
});
exports.removeNewsletter = removeNewsletter;
//get website data
const getWebsiteData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const websiteData = yield userSercice.getWebsiteData();
        if (!websiteData) {
            logger_1.default.warn('No website data found');
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)("error", "No website data found"));
        }
        logger_1.default.info('Website data fetched successfully', { websiteData });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Website data fetched successfully", websiteData));
    }
    catch (error) {
        logger_1.default.error('Error fetching website data', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error fetching website data", error));
    }
});
exports.getWebsiteData = getWebsiteData;
