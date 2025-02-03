import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');
import logger from '../../config/logger';

// Participate join the challenge api
export const joinChallenge = async (req: Request, res: Response): Promise<Response> => {
    logger.info('joinChallenge API called');
    const { errors, value } = JoinChallengeDTO.validate(req.body);
    if (errors) {
        logger.error('Validation Error', errors);
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            logger.warn(`Challenge not found with id: ${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        challenge.joinChallenge(value.participant);
        logger.info(`Participant joined the challenge successfully: ${value.participant}`);
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Participant joined the challenge successfully'));
    } catch (error) {
        logger.error('Error joining the challenge', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error joining the challenge', error));
    }
};
