import { parse, format } from 'date-fns';
import { UserRole, UserPayload } from "../types";

export function mockAdminUser() {
    const mockAdminUser: UserPayload[] = [
        { phoneNumber: "250785485001", username: 'johnDoeAdmin', names: 'Johnathan Doe', email: "john.doe.admin@gmail.com", userRole: UserRole.Admin, profile_url: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { phoneNumber: "250785485102", username: 'janeSmithAdmin', names: 'Janet Smith', email: "jane.smith.admin@gmail.com", userRole: UserRole.Admin, profile_url: 'https://randomuser.me/api/portraits/women/1.jpg' }
    ];
    return mockAdminUser;
}

export function mockParticipanteUser() {
    const mockParticipanteUser: UserPayload[] = [
        { phoneNumber: "250786461106", username: 'johnDoeParticipant', names: 'Johnny Doe', email: "john.doe.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { phoneNumber: "250785485203", username: 'janeSmithParticipant', names: 'Janelle Smith', email: "jane.smith.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { phoneNumber: "250785485304", username: 'michaelBrownParticipant', names: 'Michael Brown', email: "michael.brown.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/3.jpg' },
        { phoneNumber: "250785485405", username: 'emilyClarkParticipant', names: 'Emily Clark', email: "emily.clark.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/3.jpg' },
        { phoneNumber: "250785485506", username: 'williamJohnsonParticipant', names: 'William Johnson', email: "william.johnson.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/4.jpg' },
        { phoneNumber: "250785485607", username: 'oliviaMartinezParticipant', names: 'Olivia Martinez', email: "olivia.martinez.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/4.jpg' },
        { phoneNumber: "250785485708", username: 'jamesAndersonParticipant', names: 'James Anderson', email: "james.anderson.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/5.jpg' },
        { phoneNumber: "250785485809", username: 'sophiaTaylorParticipant', names: 'Sophia Taylor', email: "sophia.taylor.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/5.jpg' },
        { phoneNumber: "250785485910", username: 'danielMooreParticipant', names: 'Daniel Moore', email: "daniel.moore.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/6.jpg' },
        { phoneNumber: "250785485101", username: 'miaWhiteParticipant', names: 'Mia White', email: "mia.white.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/6.jpg' },
    ];
    return mockParticipanteUser;
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