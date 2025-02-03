import { parse, format } from 'date-fns';
import { UserRole, UserPayload } from "../types";

export function mockAdminUser(id: string) {
    const mockAdminUser: UserPayload[] = [
        { id: "679f2df529592efbf6df223a", username: 'johnDoeAdmin', names: 'Johnathan Doe', email: "john.doe.admin@gmail.com", userRole: UserRole.Admin, profile_url: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' },
        { id: "679f2df529592efbf6df223b", username: 'janeSmithAdmin', names: 'Janet Smith', email: "jane.smith.admin@gmail.com", userRole: UserRole.Admin, profile_url: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' }
    ];
    return mockAdminUser.find(user => user.id === id);
}

export function mockParticipanteUser(id: string) {
    const mockParticipanteUser: UserPayload[] = [
        { id: "679f2df529592efbf6df223c", username: 'johnDoeParticipant', names: 'Johnny Doe', email: "john.doe.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223d", username: 'janeSmithParticipant', names: 'Janelle Smith', email: "jane.smith.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223e", username: 'michaelBrownParticipant', names: 'Michael Brown', email: "michael.brown.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223f", username: 'emilyClarkParticipant', names: 'Emily Clark', email: "emily.clark.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223g", username: 'williamJohnsonParticipant', names: 'William Johnson', email: "william.johnson.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223h", username: 'oliviaMartinezParticipant', names: 'Olivia Martinez', email: "olivia.martinez.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223i", username: 'jamesAndersonParticipant', names: 'James Anderson', email: "james.anderson.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223j", username: 'sophiaTaylorParticipant', names: 'Sophia Taylor', email: "sophia.taylor.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223k", username: 'danielMooreParticipant', names: 'Daniel Moore', email: "daniel.moore.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
        { id: "679f2df529592efbf6df223l", username: 'miaWhiteParticipant', names: 'Mia White', email: "mia.white.participant@gmail.com", userRole: UserRole.Participant, profile_url: 'https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png' },
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