import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
const JoinDTO = require('../../dtos/joinDTO');


// Participate join the challenge api
export const joinChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = JoinDTO.validate(req.body);
    if (errors) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        challenge.joinChallenge(value.participant);
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Participant joined the challenge successfully'));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error joining the challenge', error));
    }
};
