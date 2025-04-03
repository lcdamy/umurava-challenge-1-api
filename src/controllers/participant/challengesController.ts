import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
import ChallengeParticipantsModel from '../../models/challengeParticipantsModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import { sendEmail } from "../../utils/emailService";
import { UserSercice } from '../../services/userService';
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');

const userService = new UserSercice();

// Participate join the challenge api
export const joinChallenge = async (req: Request, res: Response): Promise<Response> => {
    logger.info('joinChallenge API called!');
    try {

        const { errors, value } = JoinChallengeDTO.validate(req.body);
        if (errors) {
            logger.error('Validation Error', errors);
            const errorMessages = errors.map((error: any) => error.message).join(', ');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages));
        }


        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            logger.warn(`Challenge not found with id: ${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        const participantsCount = countParticipants(value, req.user ? (req.user as any).email : null);
        if (challenge.teamSize !== participantsCount) {
            logger.warn('Challenge must have the number of required participants');
            return res.status(StatusCodes.BAD_REQUEST).json(
                formatResponse(
                    'error',
                    `The challenge requires exactly ${challenge.teamSize} participants. Please ensure the correct number of participants is provided.`
                )
            );
        }

        const existingParticipant = await ChallengeParticipantsModel.findOne({
            challengeId: req.params.id,
            teamLead: req.user ? (req.user as any).id : null
        });

        if (existingParticipant) {
            logger.warn('Participant is already part of this challenge');
            return res.status(StatusCodes.CONFLICT).json(
                formatResponse('error', 'Participant is already part of this challenge')
            );
        }

        const participant = new ChallengeParticipantsModel({
            challengeId: req.params.id,
            teamLead: req.user && (req.user as any).id ? (req.user as any).id : 'Unknown',
            members: value.participants.members || [],
        });
        await participant.save();
        logger.info('Participant joined the challenge successfully', participant);

        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: '',
            name: '',
            message: '',
            link: '',
            link_label: ''
        };

        const admins = await userService.getAdmins() || [];
        if (admins.length === 0) {
            logger.warn('No admins found');
        } else {
            const adminEmails = admins.map((admin: any) => admin.email);
            await Promise.all(adminEmails.map((adminEmail: string) =>
                sendEmail('send_notification', 'Participant Joined Challenge', adminEmail, {
                    ...context,
                    subject: 'Participant Joined Challenge',
                    name: 'Admin',
                    message: `A participant has joined the challenge: ${challenge.challengeName}.`,
                    link: 'https://umurava-skills-challenge-xi.vercel.app/admin/dashboard',
                    link_label: 'View Dashboard'
                }).catch(error => logger.error(`Error sending email to ${adminEmail}:`, error))
            ));
        }

        await Promise.all((value.participants.members || []).map((member: string) =>
            sendEmail('send_notification', 'You Have Been Added to a Challenge', member, {
                ...context,
                subject: 'You Have Been Added to a Challenge',
                name: 'Team Member',
                message: `You have been added to the challenge: ${challenge.challengeName}.`,
                link: `https://umurava-skills-challenge-xi.vercel.app/challenges/${challenge._id}`,
                link_label: 'View Challenge'
            }).catch(error => logger.error(`Error sending email to ${member}:`, error))
        ));

        return res.status(StatusCodes.OK).json(formatResponse('success', 'Participant joined the challenge successfully'));

    } catch (error) {
        logger.error('Error joining the challenge', error);
        const errorMessage = (error as Error).message || 'Error joining the challenge';
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', errorMessage));
    }
};

//count the number of participants in a challenge
export const countParticipants = (object: { participants: { members: string[] } }, teamLead: string): number => {
    try {
        const { participants } = object;
        const uniqueParticipants = new Set([teamLead, ...(participants.members || [])]);
        return uniqueParticipants.size;
    } catch (error) {
        logger.error('Error counting participants', error);
        throw new Error('Failed to count participants');
    }
};
