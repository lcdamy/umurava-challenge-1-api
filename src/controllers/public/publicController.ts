import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { formatResponse, } from '../../utils/helper';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import User from '../../models/userModel';
import { NoticationSercice } from '../../services/notificationService';

const JoinProgramDTO = require('../../dtos/joinProgramDTO');
const JoinCommunityDTO = require('../../dtos/joinCommunityDTO');
const createNotificationDTO = require('../../dtos/createNotificationDTO');
const qrcode = require("qrcode-terminal");

const notificationService = new NoticationSercice();

// Get all skills
export const getWelcomeMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        logger.info('Fetching welcome message');
        return res.status(StatusCodes.OK).json(formatResponse("success", "Welcome to Umurava Challenge API!"));
    } catch (error) {
        logger.error('Error fetching welcome message', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error fetching welcome message", error));
    }
};

// Join the program
export const joinProgram = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = JoinProgramDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error in joinProgram', { errors });
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Validation Error", errors));
    }

    try {
        const SECRET_KEY = process.env.TOKEN_SECRET;
        if (!SECRET_KEY) {
            logger.error('Token secret is not defined');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Token secret is not defined"));
        }
        const token = jwt.sign(value, SECRET_KEY, { expiresIn: '1d', algorithm: 'HS256' });

        let user;
        if (value.userRole === 'admin') user = await User.findOne({ userRole: value.userRole });
        if (value.userRole === 'participant') user = await User.findOne({ userRole: value.userRole });

        logger.info('Token created successfully', { user, token });
        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Token for entering the program created', { user, token }));

    } catch (error) {
        logger.error('Error creating token', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error creating token", error));
    }
};

// Join WhatsApp community using whatsapp-web.js
export const joinWhatsAppCommunity = async (req: Request, res: Response) => {
    const { errors, value } = JoinCommunityDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error in joinWhatsAppCommunity', { errors });
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Validation Error", errors));
    }

    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', (qr) => {
        logger.info('QR code received for WhatsApp authentication');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        try {
            const inviteLink = process.env.COMMUNITY_INVITE_LINK;
            if (!inviteLink) {
                logger.error('Community invite link is not defined');
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Community invite link is not defined"));
            }
            const chatId = `${value.phoneNumber}@c.us`;
            await client.sendMessage(chatId, `Welcome to the Umurava Challenge WhatsApp community! Join our community: ${inviteLink}`);
            logger.info('Message sent to WhatsApp member', { chatId });
            return res.status(StatusCodes.OK).json(formatResponse("success", "Message sent to WhatsApp member"));
        } catch (error) {
            logger.error('Error sending message to WhatsApp member', { error });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error sending message to WhatsApp member", error));
        } finally {
            client.destroy();
        }
    });

    client.on('auth_failure', (msg) => {
        logger.error('Authentication failure', { msg });
        return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse("error", "Authentication failure", msg));
    });

    client.on('disconnected', (reason) => {
        logger.info('Client was logged out', { reason });
    });

    logger.info('Initializing WhatsApp client');
    client.initialize();
};

// Create a notification
export const createNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { errors, value } = createNotificationDTO.validate(req.body);
        if (errors) {
            logger.warn('Validation error in createNotification', { errors });
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Validation Error", errors));
        }

        const notification = await notificationService.createNotification(value);
        logger.info('Notification created successfully', { notification });
        return res.status(StatusCodes.CREATED).json(formatResponse("success", "Notification created successfully", notification));
    } catch (error) {
        logger.error('Error creating notification', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error creating notification", error));
    }
}

// get notifications
export const getAllNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            logger.warn('User is not authenticated');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;

        if (!userId) {
            logger.warn('User ID not found in request');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "User ID not found in request"));
        }

        const { status } = req.query; // Read status from query parameters
        const filters: { userId: string; status?: string } = { userId };

        if (status) {
            if (status !== 'read' && status !== 'unread') {
                logger.warn('Invalid status filter provided', { status });
                return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Invalid status filter. Allowed values are 'read' or 'unread'"));
            }
            filters.status = status;
        }

        const notifications = await notificationService.getAllNotifications(filters);
        if (!notifications || notifications.length === 0) {
            logger.warn('No notifications found for user', { userId });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse("error", "No notifications found for user"));
        }

        logger.info('Notifications fetched successfully', { userId, status });
        return res.status(StatusCodes.OK).json(formatResponse("success", "Notifications fetched successfully", notifications));
    } catch (error) {
        logger.error('Error fetching notifications', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error fetching notifications", error));
    }
};

// Update a notification
export const updateNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        if (!id) {
            logger.warn('Notification ID not provided');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Notification ID not provided"));
        }
        const existingNotification = await notificationService.getNotificationById(id);
        logger.info('Existing notification fetched', { existingNotification });
        if (!existingNotification) {
            logger.warn('Notification not found', { id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse("error", "Notification not found"));
        }
        const updatedNotification = await notificationService.updateNotification(id);
        logger.info('Notification updated successfully', { updatedNotification });
        return res.status(StatusCodes.OK).json(formatResponse("success", "Notification updated successfully", updatedNotification));
    } catch (error) {
        logger.error('Error updating notification in controller', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error updating notification", error));
    }
}
// Delete a notification
export const deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        if (!id) {
            logger.warn('Notification ID not provided');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Notification ID not provided"));
        }
        const existingNotification = await notificationService.getNotificationById(id);
        if (!existingNotification) {
            logger.warn('Notification not found', { id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse("error", "Notification not found"));
        }
        logger.info('Existing notification fetched', { existingNotification });
        const notification = await notificationService.deleteNotification(id);
        logger.info('Notification deleted successfully', { notification });
        return res.status(StatusCodes.OK).json(formatResponse("success", "Notification deleted successfully", notification));
    } catch (error) {
        logger.error('Error deleting notification  in controller', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error deleting notification", error));
    }
}

// Delete all notifications for a user
export const deleteAllNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            logger.warn('User is not authenticated');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;

        if (!userId) {
            logger.warn('User ID not found in request');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "User ID not found in request"));
        }
        logger.info('Deleting all notifications for user', { userId });
        const deletedNotifications = await notificationService.deleteAllNotifications(userId);
        logger.info('All notifications deleted successfully', { userId });
        return res.status(StatusCodes.OK).json(formatResponse("success", "All notifications deleted successfully", deletedNotifications));
    } catch (error) {
        logger.error('Error deleting all notifications  in controller', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error deleting all notifications", error));
    }
}

//Read all notifications for a user
export const readAllNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            logger.warn('User is not authenticated');
            return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse("error", "User is not authenticated"));
        }
        const userId = (req.user && 'id' in req.user) ? String(req.user.id) : null;

        if (!userId) {
            logger.warn('User ID not found in request');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "User ID not found in request"));
        }
        logger.info('Reading all notifications for user', { userId });
        const readNotifications = await notificationService.readAllNotifications(userId);
        logger.info('All notifications marked as read successfully', { userId });
        return res.status(StatusCodes.OK).json(formatResponse("success", "All notifications marked as read successfully", readNotifications));
    } catch (error) {
        logger.error('Error marking all notifications as read  in controller', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error marking all notifications as read", error));
    }
}
