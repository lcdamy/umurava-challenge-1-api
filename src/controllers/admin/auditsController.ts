import { Request, Response } from 'express';
import Audit from '../../models/auditModel';
import { formatResponse } from '../../utils/helper';
import { StatusCodes } from "http-status-codes";
import logger from '../../config/logger';

// Get all audits
export const getAudits = async (req: Request, res: Response): Promise<Response> => {
    try {
        const audits = await Audit.find({}).sort({ timestamp: -1 });
        logger.info('Audits fetched successfully');
        return res.status(StatusCodes.OK).json(formatResponse('success', 'Audits fetched successfully', audits));
    } catch (error) {
        logger.error('Error fetching audits', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(formatResponse('error', 'Error fetching audits', error));
    }
}





