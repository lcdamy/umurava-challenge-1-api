import { parse, format } from 'date-fns';
import { UserRole, UserPayload } from "../types";

export function mockAdminUser(id: string) {
    const mockAdminUser: UserPayload[] = [
        { id: "679f2df529592efbf6df223a", username: 'adminUser1', names: 'Admin User 1', userRole: UserRole.Admin, profile_url: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' },
        { id: "679f2df529592efbf6df223b", username: 'adminUser2', names: 'Admin User 2', userRole: UserRole.Admin, profile_url: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' }
    ];
    return mockAdminUser.find(user => user.id === id);
}

export function mockParticipanteUser(id: string) {
    const mockParticipanteUser: UserPayload[] = [
        { id: "679f2df529592efbf6df223c", username: 'participantUser1', names: 'Participant User 1', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223d", username: 'participantUser2', names: 'Participant User 2', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223e", username: 'participantUser3', names: 'Participant User 3', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223f", username: 'participantUser4', names: 'Participant User 4', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223g", username: 'participantUser5', names: 'Participant User 5', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223h", username: 'participantUser6', names: 'Participant User 6', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223i", username: 'participantUser7', names: 'Participant User 7', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223j", username: 'participantUser8', names: 'Participant User 8', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223k", username: 'participantUser9', names: 'Participant User 9', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223l", username: 'participantUser10', names: 'Participant User 10', userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
    ];
    return mockParticipanteUser.find(user => user.id === id);
};


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

export const formatResponse = (status: 'success' | 'error', message: string, data?: any) => ({ status, message, data });