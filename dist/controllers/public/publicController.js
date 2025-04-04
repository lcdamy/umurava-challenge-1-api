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
exports.readAllNotifications = exports.deleteAllNotifications = exports.deleteNotification = exports.updateNotification = exports.getAllNotifications = exports.createNotification = exports.joinWhatsAppCommunity = exports.joinProgram = exports.getWelcomeMessage = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../../utils/helper");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const notificationService_1 = require("../../services/notificationService");
const JoinProgramDTO = require('../../dtos/joinProgramDTO');
const JoinCommunityDTO = require('../../dtos/joinCommunityDTO');
const createNotificationDTO = require('../../dtos/createNotificationDTO');
const qrcode = require("qrcode-terminal");
const notificationService = new notificationService_1.NoticationSercice();
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
        const { status } = req.query; // Read status from query parameters
        const filters = { userId };
        if (status) {
            if (status !== 'read' && status !== 'unread') {
                logger_1.default.warn('Invalid status filter provided', { status });
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)("error", "Invalid status filter. Allowed values are 'read' or 'unread'"));
            }
            filters.status = status;
        }
        const notifications = yield notificationService.getAllNotifications(filters);
        if (!notifications || notifications.length === 0) {
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
        const updatedNotification = yield notificationService.updateNotification(id);
        logger_1.default.info('Notification updated successfully', { updatedNotification });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)("success", "Notification updated successfully", updatedNotification));
    }
    catch (error) {
        logger_1.default.error('Error updating notification in controller', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)("error", "Error updating notification", error));
    }
});
exports.updateNotification = updateNotification;
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
