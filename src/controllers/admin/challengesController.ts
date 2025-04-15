import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
import ChallengeParticipantsModel from '../../models/challengeParticipantsModel';
import User from '../../models/userModel';
import ChallengeCategory from '../../models/challengeCategoryModel';
import Prize from '../../models/prizesModel';
import { convertToISO, formatResponse, getDuration } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';
import { NoticationSercice } from '../../services/notificationService';

const ChallengeDTO = require('../../dtos/challengesDTO');
const UpdateChallengeDTO = require('../../dtos/updateChallengeDTO');
const ChallengeCategoryDTO = require('../../dtos/challengeCategoryDTO');
const UpdateChallengeStatusDTO = require('../../dtos/updateChallengeStatusDTO');
const UpdateChallengeSubmissionDateDTO = require('../../dtos/updateChallengeSubmissionDateDTO');
const ChallengePrizeDTO = require('../../dtos/challengePrizeDTO');

const notificationService = new NoticationSercice();

// Get all challenges
export const getChallenges = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10, search = '', all = 'false', status } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const searchQuery: any = search
        ? { $or: [{ challengeName: { $regex: search as string, $options: 'i' } }, { projectDescription: { $regex: search as string, $options: 'i' } }] }
        : {};

    if (status) {
        if (status === 'no-draft') {
            searchQuery.status = { $ne: 'draft' };
        } else {
            searchQuery.status = status;
        }
    }

    try {
        logger.info('Fetching challenges with query', { page, limit, search, all, status });
        const totalChallenges = await Challenge.countDocuments(searchQuery);
        const totalCompletedChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'completed' });
        const totalOpenChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'open' });
        const totalOngoingChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'ongoing' });
        const totalDraftChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'draft' });
        const totolClosedChallenges = await Challenge.countDocuments({ ...searchQuery, status: 'closed' });

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
            aggregates: { totalChallenges, totalCompletedChallenges, totalOpenChallenges, totalOngoingChallenges, totalDraftChallenges, totolClosedChallenges },
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
export const getChallengesById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user ? (req.user as any).id : null;

        logger.info('Fetching challenge by ID', { id });

        if (!userId) {
            logger.warn('User ID is required');
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'User ID is required'));
        }

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            logger.warn('Challenge not found', { id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        const isParticipant = await User.exists({ _id: userId, userRole: 'participant' });
        if (!isParticipant) {
            logger.info('Challenge fetched successfully for non-participant user', { id });
            return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge fetched successfully', challenge));
        }

        const joinedStatus = await ChallengeParticipantsModel.findOne({ challengeId: id, teamLead: userId });
        const submission_status = joinedStatus ? joinedStatus.submissionStatus : "not submitted";
        const challengeModified = {
            ...challenge.toObject(),
            joined_status: joinedStatus ? true : false,
            submissionStatus: submission_status
        };

        logger.info('Challenge fetched successfully for participant user', { id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge fetched successfully', challengeModified));
    } catch (error) {
        logger.error('Error fetching challenge', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenge', error));
    }
};

export const getChallengeById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        logger.info('Fetching challenge by ID', { id });

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            logger.warn('Challenge not found', { id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        logger.info('Challenge fetched successfully ', { id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge fetched successfully', challenge));
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
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        // check if the challenge already exists
        const existingChallenge = await Challenge.findOne({ challengeName: value.challengeName });
        if (existingChallenge) {
            logger.warn('Challenge already exists', { challengeName: value.challengeName });
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', 'Challenge already exists'));
        }

        const startDate = convertToISO(value.startDate);
        const endDate = convertToISO(value.endDate);

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const now = new Date();
        if (startDateObj < now || endDateObj < now || endDateObj <= startDateObj) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                formatResponse('error', 'Invalid duration: start date must be in the future and end date must be after start date')
            );
        }

        const duration = getDuration(endDate, startDate);

        const newChallenge = new Challenge({ ...value, endDate, startDate, duration });
        const savedChallenge = await newChallenge.save();
        logger.info('Challenge created successfully', { id: savedChallenge._id });

        // Notify each active admin and participant
        const notifyUsers = async (userRole: string, title: string, message: string) => {
            const users = await User.find({ userRole, status: 'active' });
            if (users.length > 0) {
                const notifications = users.map(user => ({
                    timestamp: new Date(),
                    type: 'info',
                    title,
                    message,
                    userId: user._id,
                    status: 'unread'
                }));
                await notificationService.createNotification(notifications);
            }
        };

        await notifyUsers('admin', 'Challenge Created', 'A new challenge has been created. Please review the details.');
        await notifyUsers('participant', 'Challenge Created', 'A new challenge has been created. Please check your dashboard for details.');

        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Challenge created successfully', savedChallenge));
    } catch (error) {
        logger.error('Error creating challenge', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating challenge', error));
    }
};

// Update an existing challenge
export const updateChallenge = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = UpdateChallengeDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error updating challenge', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        const startDate = convertToISO(value.startDate);
        const endDate = convertToISO(value.endDate);

        const duration = getDuration(endDate, startDate);

        logger.info('Updating challenge', { id: req.params.id });
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            logger.warn('Challenge not found for update', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        if (challenge.status === 'completed') {
            logger.warn('Attempted to update a completed challenge', { id: req.params.id });
            return res.status(StatusCodes.FORBIDDEN).json(formatResponse('error', 'Cannot update a completed challenge'));
        }

        const updatedChallenge = await Challenge.findByIdAndUpdate(req.params.id, { ...value, endDate, startDate, duration }, { new: true });
        logger.info('Challenge updated successfully', { id: req.params.id });

        // Notify each active admin and participant
        const notifyUsers = async (userRole: string, title: string, message: string) => {
            const users = await User.find({ userRole, status: 'active' });
            if (users.length > 0) {
                const notifications = users.map(user => ({
                    timestamp: new Date(),
                    type: 'info',
                    title,
                    message,
                    userId: user._id,
                    status: 'unread'
                }));
                await notificationService.createNotification(notifications);
            }
        };

        await notifyUsers('admin', 'Challenge Updated', 'The challenge has been updated. Please review the details.');
        await notifyUsers('participant', 'Challenge Updated', 'The challenge has been updated. Please check your dashboard for details.');

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
        //notify each active admin
        const admins = await User.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Challenge Deleted',
                    message: `A challenge has been deleted. Please review the details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }
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
            return parseFloat(((current - previous) / previous * 100).toFixed(2));
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

// create challenge category
export const createChallengeCategory = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengeCategoryDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error creating challenge category', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        // check if the challenge category already exists
        const existingCategory = await ChallengeCategory.findOne({ challengeCategoryName: value.challengeCategoryName });
        if (existingCategory) {
            logger.warn('Challenge category already exists', { challengeCategoryName: value.challengeCategoryName });
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', 'Challenge category already exists'));
        }

        const newChallengeCategory = new ChallengeCategory(value);
        const savedChallengeCategory = await newChallengeCategory.save();
        logger.info('Challenge category created successfully', { id: savedChallengeCategory._id });

        //notify each active admin
        const admins = await User.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Challenge Category Created',
                    message: `A new challenge category has been created. Please review the details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }

        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Challenge category created successfully', savedChallengeCategory));
    } catch (error) {
        logger.error('Error creating challenge category', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating challenge category', error));
    }
};

// update challenge category
export const updateChallengeCategory = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengeCategoryDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error updating challenge category', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        logger.info('Updating challenge category', { id: req.params.id });
        const updatedChallengeCategory = await ChallengeCategory.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedChallengeCategory) {
            logger.warn('Challenge category not found for update', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge category not found'));
        }
        logger.info('Challenge category updated successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge category updated successfully', updatedChallengeCategory));
    } catch (error) {
        logger.error('Error updating challenge category', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating challenge category', error));
    }
};
// delete challenge category
export const deleteChallengeCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        logger.info('Deleting challenge category', { id: req.params.id });
        const deletedChallengeCategory = await ChallengeCategory.findByIdAndDelete(req.params.id);
        if (!deletedChallengeCategory) {
            logger.warn('Challenge category not found for deletion', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge category not found'));
        }
        logger.info('Challenge category deleted successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge category deleted successfully'));
    } catch (error) {
        logger.error('Error deleting challenge category', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting challenge category', error));
    }
};
// Get all challenge categories
export const getChallengeCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        logger.info('Fetching challenge categories with pagination', { page, limit });
        const totalCategories = await ChallengeCategory.countDocuments();
        const categories = await ChallengeCategory.find({})
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        logger.info('Challenge categories fetched successfully with pagination');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge categories fetched successfully', {
            categories,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCategories / limitNumber),
                pageSize: limitNumber,
                totalItems: totalCategories
            }
        }));
    } catch (error) {
        logger.error('Error fetching challenge categories', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching challenge categories', error));
    }
}

// Get all prize categories
export const getPrizeCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        logger.info('Fetching prize categories with pagination', { page, limit });
        const totalCategories = await Prize.countDocuments();
        const categories = await Prize.find({})
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        logger.info('Prize categories fetched successfully with pagination');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Prize categories fetched successfully', {
            categories,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCategories / limitNumber),
                pageSize: limitNumber,
                totalItems: totalCategories
            }
        }));
    } catch (error) {
        logger.error('Error fetching prize categories', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching prize categories', error));
    }
}

//create prize category
export const createPrizeCategory = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengePrizeDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error creating prize category', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        // check if the prize category already exists
        const existingCategory = await Prize.findOne({ prizeName: value.prizeName });
        if (existingCategory) {
            logger.warn('Prize category already exists', { prizeName: value.prizeName });
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', 'Prize category already exists'));
        }

        const newPrizeCategory = new Prize({
            prizeName: value.prizeName,
            currency: value.currency,
            description: value.description
        });
        const savedPrizeCategory = await newPrizeCategory.save();
        logger.info('Prize category created successfully', { id: savedPrizeCategory._id });
        //notify each active admin
        const admins = await User.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Prize Category Created',
                    message: `A new prize category has been created. Please review the details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }

        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Prize category created successfully', savedPrizeCategory));
    } catch (error) {
        logger.error('Error creating prize category', { error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating prize category', error));
    }
}

//update prize category
export const updatePrizeCategory = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = ChallengePrizeDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error updating prize category', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        logger.info('Updating prize category', { id: req.params.id });
        const updatedPrizeCategory = await Prize.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedPrizeCategory) {
            logger.warn('Prize category not found for update', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Prize category not found'));
        }
        logger.info('Prize category updated successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Prize category updated successfully', updatedPrizeCategory));
    } catch (error) {
        logger.error('Error updating prize category', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating prize category', error));
    }
}
//delete prize category
export const deletePrizeCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        logger.info('Deleting prize category', { id: req.params.id });
        const deletedPrizeCategory = await Prize.findByIdAndDelete(req.params.id);
        if (!deletedPrizeCategory) {
            logger.warn('Prize category not found for deletion', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Prize category not found'));
        }
        logger.info('Prize category deleted successfully', { id: req.params.id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Prize category deleted successfully'));
    } catch (error) {
        logger.error('Error deleting prize category', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting prize category', error));
    }
}

//update challenge status
export const updateChallengeStatus = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = UpdateChallengeStatusDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error updating challenge status', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        const { id } = req.params;
        const { status } = value;
        logger.info('Fetching challenge for status update', { id });
        const challenge = await Challenge.findById(id);
        if (!challenge) {
            logger.warn('Challenge not found for status update', { id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        if (challenge.status === 'completed') {
            logger.warn('Attempted to update status of a completed challenge', { id });
            return res.status(StatusCodes.FORBIDDEN).json(formatResponse('error', 'Cannot update status of a completed challenge'));
        }
        if (challenge.status === status) {
            logger.warn('Attempted to update status to the same value', { id, status });
            return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Status is already set to this value'));
        }

        logger.info('Updating challenge status', { id: req.params.id });
        const updatedChallenge = await Challenge.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedChallenge) {
            logger.warn('Challenge not found for status update', { id: req.params.id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }
        logger.info('Challenge status updated successfully', { id: req.params.id });

        // Notify each active admin
        const admins = await User.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Challenge Status Updated',
                    message: `The status of the challenge has been updated. Please review the details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }

        // Notify each active participant
        const participants = await ChallengeParticipantsModel.find({ challengeId: id });
        if (participants.length > 0) {
            for (const participant of participants) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Challenge Status Updated',
                    message: `The status of the challenge has been updated. Please check your dashboard for details.`,
                    userId: participant.teamLead,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }
        logger.info('Challenge status updated successfully', { id: req.params.id });

        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge status updated successfully', updatedChallenge));
    } catch (error) {
        logger.error('Error updating challenge status', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating challenge status', error));
    }
}
// update grace period
export const updateGracePeriod = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = UpdateChallengeSubmissionDateDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation error updating challenge grace period', { errors });
        const errorMessages = errors.map((error: any) => error.message).join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', errorMessages, errors));
    }
    try {
        const { id } = req.params;
        const { new_submissionDate } = value;

        logger.info('Fetching challenge for grace period update', { id });
        const challenge = await Challenge.findById(id);
        if (!challenge) {
            logger.warn('Challenge not found for grace period update', { id });
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Challenge not found'));
        }

        if (new Date(new_submissionDate) <= new Date(challenge.endDate)) {
            logger.warn('Invalid grace period: must be after the challenge end date', { id, new_submissionDate });
            return res.status(StatusCodes.BAD_REQUEST).json(
                formatResponse('error', 'Invalid grace period: must be after the challenge end date')
            );
        }

        challenge.endDate = new Date(new_submissionDate);
        const updatedChallenge = await challenge.save();

        // notify each active admin
        const admins = await User.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Challenge Deadline Updated',
                    message: `The Deadline for the challenge has been updated. Please review the details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }
        // notify each active participant
        const participants = await ChallengeParticipantsModel.find({ challengeId: id });
        if (participants.length > 0) {
            for (const participant of participants) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Challenge Deadline Updated',
                    message: `The Deadline for the challenge has been updated. Please check your dashboard for details.`,
                    userId: participant.teamLead,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }
        logger.info('Grace period updated successfully', { id });

        logger.info('Challenge grace period updated successfully', { id });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenge grace period updated successfully', updatedChallenge));
    } catch (error) {
        console.error(error);
        logger.error('Error updating challenge grace period', { id: req.params.id, error });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating challenge grace period', error));
    }
}

