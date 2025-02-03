import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { formatResponse, mockAdminUser, mockParticipanteUser } from '../../utils/helper';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
const JoinProgramDTO = require('../../dtos/joinProgramDTO');
const JoinCommunityDTO = require('../../dtos/joinCommunityDTO');
const qrcode = require("qrcode-terminal");

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
        if (value.userRole === 'admin') user = mockAdminUser("679f2df529592efbf6df223a");
        if (value.userRole === 'participant') user = mockParticipanteUser("679f2df529592efbf6df223c");

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
