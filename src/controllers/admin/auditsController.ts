import { Request, Response } from 'express';
import Audit from '../../models/auditModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';

// Get all audits
export const getAudits = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        const audits = await Audit.find({})
            .sort({ timestamp: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalAudits = await Audit.countDocuments({});
        const totalPages = Math.ceil(totalAudits / limitNumber);

        logger.info('Audits fetched successfully with pagination');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Audits fetched successfully', {
            audits,
            pagination: {
                totalAudits,
                totalPages,
                currentPage: pageNumber,
                pageSize: limitNumber
            }
        }));
    } catch (error) {
        logger.error('Error fetching audits', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching audits', error));
    }
}





