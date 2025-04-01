import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                [key: string]: any; // Add other properties if needed
            };
        }
    }
}