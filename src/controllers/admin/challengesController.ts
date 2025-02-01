import { Request, Response } from 'express';
import Challenge from '../../models/challengeModel';
const ChallengeDTO = require('../../dtos/challengesDTO');
import { convertToISO, formatResponse, getStartDate } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";

// Get all challenges
export const getChallenges = async (req: Request, res: Response): Promise<Response> => {
    try {
        const challenges = await Challenge.find();
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Challenges fetched successfully', challenges));
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
        req.body.endDate = convertToISO(req.body.endDate);
        req.body.startDate = getStartDate(req.body.endDate, req.body.duration);
        const newChallenge = new Challenge(req.body);
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
        const updatedChallenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
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