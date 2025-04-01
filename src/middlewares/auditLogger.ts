import { Request, Response, NextFunction } from 'express';
import Audit from '../models/auditModel';

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    let oldSend = res.send;
    res.send = function (data) {
        res.locals.body = data;
        return oldSend.call(res, data);
    };
    res.on('finish', async () => {
        const endTime = Date.now();
        const duration = `${endTime - startTime}ms`; // duration is in milliseconds
        const auditLog = new Audit();
        const xForwardedFor = req.headers['x-forwarded-for'];
        auditLog.timestamp = new Date();
        auditLog.method = req.method;
        auditLog.url = req.originalUrl;
        auditLog.statusCode = res.statusCode;
        auditLog.duration = duration;
        auditLog.userAgent = req.headers['user-agent'] || 'unknown';
        auditLog.ipAddress = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor || req.ip || 'unknown';

        let responseBody;
        try {
            responseBody = JSON.parse(res.locals.body);
        } catch (error) {
            responseBody = { message: 'unknown', status: 'unknown' };
        }

        auditLog.activity = req.method;
        auditLog.details = responseBody.message || 'unknown';
        auditLog.status = responseBody.status || 'unknown';

        // Check if the user is authenticated and get the email
        auditLog.doneBy = 'unknown';

        // Save the audit log to the database
        await auditLog.save().catch((err) => {
            console.error('Error saving audit log:', err);
        });

        console.log('Audit log saved successfully!');
    });
    next();
};