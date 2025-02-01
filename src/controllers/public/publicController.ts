import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { formatResponse } from '../../utils/helper';
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
    const { errors, value } = JoinDTO.validate(req.body);
    if (errors) {
        return res.status(400).json(formatResponse("error", "Validation Error", errors));
    }

    try {
        const SECRET_KEY = process.env.TOKEN_SECRET;
        if (!SECRET_KEY) {
            return res.status(500).json(formatResponse("error", "Token secret is not defined"));
        }
        const token = jwt.sign(req.body, SECRET_KEY, { algorithm: 'HS256' });
        return res.status(201).json(formatResponse('success', 'Token for entering the program created', { token }));

    } catch (error) {
        return res.status(500).json(formatResponse("error", "Token secret not created", error));
    }
};

