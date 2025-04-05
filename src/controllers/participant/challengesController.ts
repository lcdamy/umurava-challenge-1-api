import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
import ChallengeParticipantsModel from '../../models/challengeParticipantsModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import { sendEmail } from "../../utils/emailService";
import { UserSercice } from '../../services/userService';
import { NoticationSercice } from '../../services/notificationService';

const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');

const userService = new UserSercice();

// Participate join the challenge API
export const joinChallenge = async (req: Request, res: Response): Promise<Response> => {
    logger.info('joinChallenge API called!');
    try {
        const { errors, value } = JoinChallengeDTO.validate(req.body);
        if (errors) {
            const errorMessages = errors.map((error: any) => error.message).join(', ');
            logger.error('Validation Error', errorMessages);
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages));
        }

        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            logger.warn(`Challenge not found with id: ${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        const teamLeadEmail = req.user ? (req.user as any).email : null;
        const participantsCount = countParticipants(value, teamLeadEmail);
        if (challenge.teamSize !== participantsCount) {
            const errorMessage = `The challenge requires exactly ${challenge.teamSize} participants. Please ensure the correct number of participants is provided.`;
            logger.warn(errorMessage);
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessage));
        }

        const existingParticipant = await ChallengeParticipantsModel.findOne({
            challengeId: req.params.id,
            teamLead: req.user ? (req.user as any).id : null
        });

        if (existingParticipant) {
            const errorMessage = 'Participant is already part of this challenge';
            logger.warn(errorMessage);
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', errorMessage));
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

        const admins = await userService.getAdmins();
        if (admins && admins.length > 0) {
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

            const notificationService = new NoticationSercice();
            await Promise.all(admins.map((admin: any) =>
                notificationService.createNotification({
                    timestamp: new Date(),
                    type: 'info',
                    message: `A new user has registered on the platform. Please review their details.`,
                    userId: admin._id,
                    status: 'unread'
                })
            ));
            logger.info('Notification sent to admins successfully');
        } else {
            logger.warn('No admins found');
        }

        const memberEmails = value.participants.members || [];
        await Promise.all(memberEmails.map((member: string) =>
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
        const errorMessage = (error as Error).message || 'Error joining the challenge';
        logger.error('Error joining the challenge', errorMessage);
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

//get all participants in a challenge
export const getParticipantChallenges = async (req: Request, res: Response): Promise<Response> => {
    logger.info('getParticipantChallenges API called!');
    try {
        const { challenge_id } = req.params;
        if (!challenge_id) {
            logger.warn('Challenge ID is required');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Challenge ID is required'));
        }
        // Check if the challenge exists
        const challenge = await Challenge.findById(challenge_id);
        if (!challenge) {
            logger.warn(`Challenge not found with id: ${challenge_id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
 
        const participantChallenges = await ChallengeParticipantsModel.find({ challengeId: challenge_id })
            .populate('teamLead', 'names profile_url email')
            .populate('members', 'email')
        if (!participantChallenges || participantChallenges.length === 0) {
            logger.warn(`No participants found for challenge with id: ${challenge_id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'No participants found for this challenge'));
        }
        logger.info('Participant challenges retrieved successfully', participantChallenges);
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Participant challenges retrieved successfully', { participantChallenges }));
    } catch (error) {
        const errorMessage = (error as Error).message || 'Error retrieving participant challenges';
        logger.error('Error retrieving participant challenges', errorMessage);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', errorMessage));
    }
}





