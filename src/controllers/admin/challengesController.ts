import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
const ChallengeDTO = require('../../dtos/challengesDTO');
import { convertToISO, formatResponse, getStartDate } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";

// Get all challenges
export const getChallenges = async (req: Request, res: Response): Promise<Response> => {
    try {
        const totalChallenges = await Challenge.countDocuments();
        const totalCompletedChallenges = await Challenge.countDocuments({ status: 'completed' });
        const totalOpenChallenges = await Challenge.countDocuments({ status: 'open' });
        const totalOngoingChallenges = await Challenge.countDocuments({ status: 'ongoing' });
        const challenges = await Challenge.find().sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenges fetched successfully', {
            aggregates: { totalChallenges, totalCompletedChallenges, totalOpenChallenges, totalOngoingChallenges },
            challenges
        }));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenges', error));
    }
};

// Get a single challenge by ID
export const getChallengeById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge fetched successfully', challenge));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenge', error));
    }
};

// Create a new challenge
export const createChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengeDTO.validate(req.body);
    if (errors) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {

        const endDate = convertToISO(value.endDate);
        const startDate = getStartDate(endDate, value.duration);
        if (new Date(startDate) < new Date()) {
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Invalid duration'));
        }
        const newChallenge = new Challenge({ ...value, endDate, startDate });
        const savedChallenge = await newChallenge.save();
        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Challenge created successfully', savedChallenge));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating challenge', error));
    }
};

// Update an existing challenge
export const updateChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengeDTO.validate(req.body);
    if (errors) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const updatedChallenge = await Challenge.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedChallenge) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge updated successfully', updatedChallenge));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating challenge', error));
    }
};

// Delete a challenge
export const deleteChallenge = async (req: Request, res: Response): Promise<Response> => {
    try {
        const deletedChallenge = await Challenge.findByIdAndDelete(req.params.id);
        if (!deletedChallenge) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge deleted successfully'));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting challenge', error));
    }
};

//Get all challenges statistics, Total number of challenges this week, Total number of participants this week, Total number of completed challenges in the last 30 days, Total number of ongoing challenges in the last 30 days, TOTAL number of open challenges in the last 30 days.
export const getChallengesStatistics = async (req: Request, res: Response): Promise<Response> => {
    try {
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

        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenges statistics fetched successfully', {
            totalChallengesThisWeek,
            totalChallengesThisWeekChange: calculatePercentageChange(totalChallengesThisWeek, totalChallengesPreviousWeek),
            totalParticipantsThisWeek: totalParticipantsThisWeek.length,
            totalParticipantsThisWeekChange: calculatePercentageChange(totalParticipantsThisWeek.length, totalParticipantsPreviousWeek.length),
            totalCompletedChallenges,
            totalCompletedChallengesChange: calculatePercentageChange(totalCompletedChallenges, totalCompletedChallengesPrevious),
            totalOngoingChallenges,
            totalOngoingChallengesChange: calculatePercentageChange(totalOngoingChallenges, totalOngoingChallengesPrevious),
            totalOpenChallenges,
            totalOpenChallengesChange: calculatePercentageChange(totalOpenChallenges, totalOpenChallengesPrevious)
        }));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenges statistics', error));
    }
}