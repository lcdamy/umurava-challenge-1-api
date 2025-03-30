import { parse, format } from 'date-fns';
import jwt from "jsonwebtoken"

export function convertToISO(date: string): string {
    const formats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'yyyy/MM/dd'];
    let parsedDate: Date | undefined;

    for (const fmt of formats) {
        const tempDate = parse(date, fmt, new Date());
        if (!isNaN(tempDate.getTime())) {
            parsedDate = tempDate;
            break;
        }
    }

    if (!parsedDate) {
        throw new Error('Invalid date format');
    }

    return format(parsedDate, 'yyyy-MM-dd');
}


export function getStartDate(endDate: string, duration: number): string {
    const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid end date format');
    }
    const startDate = new Date(parsedEndDate);
    startDate.setDate(parsedEndDate.getDate() - duration);

    return format(startDate, 'yyyy-MM-dd');
}

export function getDuration(endDate: string, startDate: string): number {
    const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());
    const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedEndDate.getTime()) || isNaN(parsedStartDate.getTime())) {
        throw new Error('Invalid date format');
    }
    const duration = parsedEndDate.getTime() - parsedStartDate.getTime();
    return Math.ceil(duration / (1000 * 60 * 60 * 24));
}

export const formatResponse = (status: 'success' | 'error', message: string, data?: any) => ({ status, message, data });

export const generateToken = (payload: object, expiresIn: number) => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is not defined");
    }
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
    if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET is not defined");
    }
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
};

export const generateRandomPassword = (length: number) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}