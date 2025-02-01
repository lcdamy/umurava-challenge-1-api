import { parse, format } from 'date-fns';

export function calculateDaysBetweenDates(startDate: string, endDate: string): number {
    const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDifference = end.getTime() - start.getTime();

    return Math.round(timeDifference / millisecondsPerDay);
}


export function convertToISO(date: string): string {
    const formats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy', 'MM-dd-yyyy'];
    let parsedDate;

    for (const fmt of formats) {
        parsedDate = parse(date, fmt, new Date());
        if (!isNaN(parsedDate.getTime())) {
            break;
        }
    }

    if (!parsedDate || isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
    }

    return format(parsedDate, 'yyyy-MM-dd');
}


export function getEndDate(startDate: string, duration: number): string {
    const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
    const endDate = new Date(parsedStartDate);
    endDate.setDate(parsedStartDate.getDate() + duration);

    return format(endDate, 'yyyy-MM-dd');
}

export function getStartDate(endDate: string, duration: number): string {
    const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());
    const startDate = new Date(parsedEndDate);
    startDate.setDate(parsedEndDate.getDate() - duration);

    return format(startDate, 'yyyy-MM-dd');
}

export const formatResponse = (status: 'success' | 'error', message: string, data?: any) => ({ status, message, data });