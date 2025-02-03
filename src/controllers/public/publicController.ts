import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { formatResponse, mockAdminUser, mockParticipanteUser } from '../../utils/helper';
import { UserPayload } from '../../types';
const JoinDTO = require('../../dtos/joinDTO');


// Get all skills
export const getWelcomeMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res.status(200).json(formatResponse("success", "Welcome to Umurava Challenge API!"));
    } catch (error) {
        return res.status(500).json(formatResponse("error", "Error fetching welcome message", error));
    }
};

// Join the program
export const joinChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { error, value } = JoinDTO.validate(req.body);
    if (error) {
        return res.status(400).json(formatResponse("error", "Validation Error", error.details));
    }

    try {
        const SECRET_KEY = process.env.TOKEN_SECRET;
        if (!SECRET_KEY) {
            return res.status(500).json(formatResponse("error", "Token secret is not defined"));
        }
        const token = jwt.sign(value, SECRET_KEY, { algorithm: 'HS256' });

        let user;
        if (value.userRole === 'admin') user = mockAdminUser("679f2df529592efbf6df223a");
        if (value.userRole === 'participant') user = mockParticipanteUser("679f2df529592efbf6df223c");

        return res.status(201).json(formatResponse('success', 'Token for entering the program created', { user, token }));

    } catch (error) {
        return res.status(500).json(formatResponse("error", "Error creating token", error));
    }
};

