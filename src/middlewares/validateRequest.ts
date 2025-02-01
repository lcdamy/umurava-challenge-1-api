import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

function validateRequest(dto: ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        const { error } = dto.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(detail => detail.message) });
        }
        next();
    };
}

module.exports = validateRequest;
