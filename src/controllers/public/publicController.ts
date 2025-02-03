import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { formatResponse, mockAdminUser, mockParticipanteUser } from '../../utils/helper';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { StatusCodes } from "http-status-codes";
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');
const JoinCommunityDTO = require('../../dtos/joinCommunityDTO');
const qrcode = require("qrcode-terminal");

// Get all skills
export const getWelcomeMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res.status(StatusCodes.OK).json(formatResponse("success", "Welcome to Umurava Challenge API!"));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error fetching welcome message", error));
    }
};

// Join the program
export const joinProgram = async (req: Request, res: Response): Promise<Response> => {
    const { error, value } = JoinChallengeDTO.validate(req.body);
    if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Validation Error", error.details));
    }

    try {
        const SECRET_KEY = process.env.TOKEN_SECRET;
        if (!SECRET_KEY) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Token secret is not defined"));
        }
        const token = jwt.sign(value, SECRET_KEY, { algorithm: 'HS256' });

        let user;
        if (value.userRole === 'admin') user = mockAdminUser("679f2df529592efbf6df223a");
        if (value.userRole === 'participant') user = mockParticipanteUser("679f2df529592efbf6df223c");

        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Token for entering the program created', { user, token }));

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error creating token", error));
    }
};

// Join WhatsApp community using whatsapp-web.js
export const joinWhatsAppCommunity = async (req: Request, res: Response) => {
    const { error, value } = JoinCommunityDTO.validate(req.body);
    if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse("error", "Validation Error", error.details));
    }

    const client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        try {
            const inviteLink = process.env.COMMUNITY_INVITE_LINK;
            if (!inviteLink) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Community invite link is not defined"));
            }
            const chatId = `${value.phoneNumber}@c.us`;
            await client.sendMessage(chatId, `Welcome to the Umurava Challenge WhatsApp community! Join our community: ${inviteLink}`);
            return res.status(StatusCodes.OK).json(formatResponse("success", "Message sent to WhatsApp member"));
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse("error", "Error sending message to WhatsApp member", error));
        } finally {
            client.destroy();
        }
    });

    client.on('auth_failure', (msg) => {
        return res.status(StatusCodes.UNAUTHORIZED).json(formatResponse("error", "Authentication failure", msg));
    });

    client.on('disconnected', (reason) => {
        console.log('Client was logged out', reason);
    });

    client.initialize();
};
