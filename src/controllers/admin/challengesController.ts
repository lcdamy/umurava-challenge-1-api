import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
const ChallengeDTO = require('../../dtos/challengesDTO');
import { convertToISO, formatResponse, getStartDate } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import User from '../../models/userModel';

// Get all challenges
export const getChallenges = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10, search = '', all = 'false' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const searchQuery = search ? { $text: { $search: search as string } } : {};

    try {
        logger.info('Fetching challenges with query', { page, limit, search, all });
        const totalChallenges = await Challenge.countDocuments(searchQuery);
        const totalCompletedChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'completed' });
        const totalOpenChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'open' });
        const totalOngoingChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'ongoing' });

        let challenges;
        if (all === 'true') {
            challenges = await Challenge.find(searchQuery).sort({ createdAt: -1 });
        } else {
            challenges = await Challenge.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);
        }

        logger.info('Challenges fetched successfully');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenges fetched successfully', {
            aggregates: { totalChallenges, totalCompletedChallenges, totalOpenChallenges, totalOngoingChallenges },
            challenges,
            pagination: all === 'true' ? null : {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalChallenges / limitNumber),
                pageSize: limitNumber,
                totalItems: totalChallenges
            }
        }));
    } catch (error) {
        logger.error('Error fetching challenges', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenges', error));
    }
};

// Get a single challenge by ID
export const getChallengeById = async (req: Request, res: Response): Promise<Response> => {
    try {
        logger.info('Fetching challenge by ID', { id: req.params.id });
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            logger.warn('Challenge not found', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        // Fetch participant data manually
        const participants = challenge.participants.map(participant => User.findById(participant));

        // Add participants data to the challenge object
        const challengeWithParticipants = {
            ...challenge.toObject(),
            participants
        };

        logger.info('Challenge fetched successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge fetched successfully', challengeWithParticipants));
    } catch (error) {
        logger.error('Error fetching challenge', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenge', error));
    }
};

// Create a new challenge
export const createChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengeDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error creating challenge', { errors });
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const endDate = convertToISO(value.endDate);
        const startDate = getStartDate(endDate, value.duration);
        if (new Date(startDate) < new Date()) {
            logger.warn('Invalid duration for challenge', { startDate, endDate });
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Invalid duration'));
        }
        const newChallenge = new Challenge({ ...value, endDate, startDate });
        const savedChallenge = await newChallenge.save();
        logger.info('Challenge created successfully', { id: savedChallenge._id });
        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Challenge created successfully', savedChallenge));
    } catch (error) {
        logger.error('Error creating challenge', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating challenge', error));
    }
};

// Update an existing challenge
export const updateChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengeDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error updating challenge', { errors });
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        logger.info('Updating challenge', { id: req.params.id });
        const updatedChallenge = await Challenge.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedChallenge) {
            logger.warn('Challenge not found for update', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        logger.info('Challenge updated successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge updated successfully', updatedChallenge));
    } catch (error) {
        logger.error('Error updating challenge', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating challenge', error));
    }
};

// Delete a challenge
export const deleteChallenge = async (req: Request, res: Response): Promise<Response> => {
    try {
        logger.info('Deleting challenge', { id: req.params.id });
        const deletedChallenge = await Challenge.findByIdAndDelete(req.params.id);
        if (!deletedChallenge) {
            logger.warn('Challenge not found for deletion', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        logger.info('Challenge deleted successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge deleted successfully'));
    } catch (error) {
        logger.error('Error deleting challenge', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting challenge', error));
    }
};

// Get all challenges statistics
export const getChallengesStatistics = async (req: Request, res: Response): Promise<Response> => {
    try {
        logger.info('Fetching challenges statistics');
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const last30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        const previousWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
        const previous30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);

        const totalChallengesThisWeek = await Challenge.countDocuments({ createdAt: { $gte: lastWeek } });
        const totalChallengesPreviousWeek = await Challenge.countDocuments({ createdAt: { $gte: previousWeek, $lt: lastWeek } });
        const totalParticipantsThisWeek = await Challenge.distinct('participants', { createdAt: { $gte: lastWeek } });
        const totalParticipantsPreviousWeek = await Challenge.distinct('participants', { createdAt: { $gte: previousWeek, $lt: lastWeek } });
        const totalCompletedChallenges = await Challenge.countDocuments({ status: 'completed', updatedAt: { $gte: last30Days } });
        const totalCompletedChallengesPrevious = await Challenge.countDocuments({ status: 'completed', updatedAt: { $gte: previous30Days, $lt: last30Days } });
        const totalOngoingChallenges = await Challenge.countDocuments({ status: 'ongoing', updatedAt: { $gte: last30Days } });
        const totalOngoingChallengesPrevious = await Challenge.countDocuments({ status: 'ongoing', updatedAt: { $gte: previous30Days, $lt: last30Days } });
        const totalOpenChallenges = await Challenge.countDocuments({ status: 'open', createdAt: { $gte: last30Days } });
        const totalOpenChallengesPrevious = await Challenge.countDocuments({ status: 'open', createdAt: { $gte: previous30Days, $lt: last30Days } });

        const calculatePercentageChange = (current: number, previous: number) => {
            if (previous === 0) return current === 0 ? 0 : 100;
            return ((current - previous) / previous) * 100;
        };

        const calculateChangeDirection = (current: number, previous: number) => {
            return current >= previous ? 'positive' : 'negative';
        };

        logger.info('Challenges statistics fetched successfully');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenges statistics fetched successfully', {
            totalChallengesThisWeek,
            totalChallengesThisWeekChange: calculatePercentageChange(totalChallengesThisWeek, totalChallengesPreviousWeek),
            totalChallengesThisWeekChangeDirection: calculateChangeDirection(totalChallengesThisWeek, totalChallengesPreviousWeek),
            totalParticipantsThisWeek: totalParticipantsThisWeek.length,
            totalParticipantsThisWeekChange: calculatePercentageChange(totalParticipantsThisWeek.length, totalParticipantsPreviousWeek.length),
            totalParticipantsThisWeekChangeDirection: calculateChangeDirection(totalParticipantsThisWeek.length, totalParticipantsPreviousWeek.length),
            totalCompletedChallenges,
            totalCompletedChallengesChange: calculatePercentageChange(totalCompletedChallenges, totalCompletedChallengesPrevious),
            totalCompletedChallengesChangeDirection: calculateChangeDirection(totalCompletedChallenges, totalCompletedChallengesPrevious),
            totalOngoingChallenges,
            totalOngoingChallengesChange: calculatePercentageChange(totalOngoingChallenges, totalOngoingChallengesPrevious),
            totalOngoingChallengesChangeDirection: calculateChangeDirection(totalOngoingChallenges, totalOngoingChallengesPrevious),
            totalOpenChallenges,
            totalOpenChallengesChange: calculatePercentageChange(totalOpenChallenges, totalOpenChallengesPrevious),
            totalOpenChallengesChangeDirection: calculateChangeDirection(totalOpenChallenges, totalOpenChallengesPrevious)
        }));
    } catch (error) {
        logger.error('Error fetching challenges statistics', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenges statistics', error));
    }
};