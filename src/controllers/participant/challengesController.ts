import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');
import logger from '../../config/logger';
import { sendEmail } from "../../utils/emailService";

// Participate join the challenge api
export const joinChallenge = async (req: Request, res: Response): Promise<Response> => {
    logger.info('joinChallenge API called!');
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
        logger.info(`Participant joined the challenge successfully:: ${challenge.challengeName}`);

        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Participant Joined Challenge',
            name: 'admin',
            message: '',
            link: '',
            link_label: ''
        };
        const sendWelcomeEmail = async (message: string, linkLabel: string) => {
            context.message = message;
            context.link_label = linkLabel;
            await sendEmail('send_notification', 'Participant Joined Challenge', 'zudanga@gmail.com', context)
                .then(result => logger.info('Email sent:', result))
                .catch(error => logger.error('Error sending email:', error));
        };
        await sendWelcomeEmail(
            `Participant has joined the challenge: ${challenge.challengeName}`,
            'Log In Now'
        );

        return res.status(StatusCodes.OK).json(formatResponse('success', 'Participant joined the challenge successfully'));

    } catch (error) {
        logger.error('Error joining the challenge', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error joining the challenge', error));
    }

};
