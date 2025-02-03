import { Request, Response } from 'express';
import Skill from '../../models/skillsModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
const SkillDTO = require('../../dtos/skillsDTO');

// Get all skills
export const getSkills = async (req: Request, res: Response): Promise<Response> => {
    try {
        const skills = await Skill.find({ status: "active" });
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skills fetched successfully', skills));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching skills', error));
    }
};

// Get a single skill by ID
export const getSkillById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Skill not found'));
        }
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skill fetched successfully', skill));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching skill', error));
    }
};

// Create a new skill
export const createSkill = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = SkillDTO.validate(req.body);
    if (errors) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const newSkill = new Skill(value);
        const savedSkill = await newSkill.save();
        return res.status(StatusCodes.CREATED).json(formatResponse('success', 'Skill created successfully', savedSkill));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error creating skill', error));
    }
};

// Update an existing skill
export const updateSkill = async (req: Request, res: Response): Promise<Response> => {
    const { errors, value } = SkillDTO.validate(req.body);
    if (errors) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatResponse('error', 'Validation Error', errors));
    }
    try {
        const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedSkill) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Skill not found'));
        }
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skill updated successfully', updatedSkill));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error updating skill', error));
    }
};

// Delete a skill
export const deleteSkill = async (req: Request, res: Response): Promise<Response> => {
    try {
        const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
        if (!deletedSkill) {
            return res.status(StatusCodes.NOT_FOUND).json(formatResponse('error', 'Skill not found'));
        }
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Skill deleted successfully'));
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error deleting skill', error));
    }
};