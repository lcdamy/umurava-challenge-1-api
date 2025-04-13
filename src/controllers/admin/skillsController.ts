import { Request, Response } from 'express';
import Skill from '../../models/skillsModel';
import User from '../../models/userModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
const SkillDTO = require('../../dtos/skillsDTO');
import logger from '../../config/logger';
import { NoticationSercice } from '../../services/notificationService';

const notificationService = new NoticationSercice();

// Get all skills
export const getSkills = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        const skills = await Skill.find({ status: "active" })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalSkills = await Skill.countDocuments({ status: "active" });
        const totalPages = Math.ceil(totalSkills / limitNumber);

        logger.info('Skills fetched successfully with pagination');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skills fetched successfully', {
            skills,
            pagination: {
                totalItems: totalSkills,
                totalPages,
                currentPage: pageNumber,
                itemsPerPage: limitNumber
            }
        }));
    } catch (error) {
        logger.error('Error fetching skills', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching skills', error));
    }
};

// Get a single skill by ID
export const getSkillById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            logger.warn(`Skill not found with ID: ${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Skill not found'));
        }
        logger.info(`Skill fetched successfully with ID: ${req.params.id}`);
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skill fetched successfully', skill));
    } catch (error) {
        logger.error('Error fetching skill', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching skill', error));
    }
};

// Create a new skill
export const createSkill = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = SkillDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation Error', errors);
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        // Check if the skill already exists
        const existingSkill = await Skill.findOne({ skillName: value.skillName });
        if (existingSkill) {
            logger.warn(`Skill with skillName "${value.skillName}" already exists`);
            return res.status(StatusCodes.CONFLICT).json(formatResponse('error', 'Skill already exists'));
        }

        const newSkill = new Skill(value);
        const savedSkill = await newSkill.save();
        logger.info('Skill created successfully');
        //notify each active admin
        const admins = await User.find({ userRole: 'admin', status: 'active' });
        if (admins.length > 0) {
            for (const admin of admins) {
                const notification = {
                    timestamp: new Date(),
                    type: 'info',
                    title: 'New Skill Created',
                    message: `A new skill "${value.skillName}" has been added. Please review the details.`,
                    userId: admin._id,
                    status: 'unread'
                };
                await notificationService.createNotification(notification);
            }
        }

        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Skill created successfully', savedSkill));
    } catch (error) {
        logger.error('Error creating skill', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating skill', error));
    }
};

// Update an existing skill
export const updateSkill = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = SkillDTO.validate(req.body);
    if (errors) {
        logger.warn('Validation Error', errors);
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedSkill) {
            logger.warn(`Skill not found with ID: ${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Skill not found'));
        }
        logger.info(`Skill updated successfully with ID: ${req.params.id}`);
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skill updated successfully', updatedSkill));
    } catch (error) {
        logger.error('Error updating skill', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating skill', error));
    }
};

// Delete a skill
export const deleteSkill = async (req: Request, res: Response): Promise<Response> => {
    try {
        const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
        if (!deletedSkill) {
            logger.warn(`Skill not found with ID: ${req.params.id}`);
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Skill not found'));
        }
        logger.info(`Skill deleted successfully with ID: ${req.params.id}`);
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skill deleted successfully'));
    } catch (error) {
        logger.error('Error deleting skill', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting skill', error));
    }
};