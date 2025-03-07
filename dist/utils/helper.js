"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResponse = void 0;
exports.mockAdminUser = mockAdminUser;
exports.mockParticipanteUser = mockParticipanteUser;
exports.convertToISO = convertToISO;
exports.getStartDate = getStartDate;
exports.getDuration = getDuration;
const date_fns_1 = require("date-fns");
const types_1 = require("../types");
function mockAdminUser() {
    const mockAdminUser = [
        { phoneNumber: "250785485001", username: 'peter', names: 'Peter Damien', email: "zudanga@gmail.com", userRole: types_1.UserRole.Admin, profile_url: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { phoneNumber: "250785485102", username: 'janeSmithAdmin', names: 'Janet Smith', email: "waka.florien45@gmail.com", userRole: types_1.UserRole.Admin, profile_url: 'https://randomuser.me/api/portraits/women/1.jpg' }
    ];
    return mockAdminUser;
}
function mockParticipanteUser() {
    const mockParticipanteUser = [
        { phoneNumber: "250786461106", username: 'waka', names: 'Waka Florien', email: "waka.florien45@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { phoneNumber: "250785485203", username: 'janeSmithParticipant', names: 'Janelle Smith', email: "jane.smith.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { phoneNumber: "250785485304", username: 'michaelBrownParticipant', names: 'Michael Brown', email: "michael.brown.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/3.jpg' },
        { phoneNumber: "250785485405", username: 'emilyClarkParticipant', names: 'Emily Clark', email: "emily.clark.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/3.jpg' },
        { phoneNumber: "250785485506", username: 'williamJohnsonParticipant', names: 'William Johnson', email: "william.johnson.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/4.jpg' },
        { phoneNumber: "250785485607", username: 'oliviaMartinezParticipant', names: 'Olivia Martinez', email: "olivia.martinez.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/4.jpg' },
        { phoneNumber: "250785485708", username: 'jamesAndersonParticipant', names: 'James Anderson', email: "james.anderson.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/5.jpg' },
        { phoneNumber: "250785485809", username: 'sophiaTaylorParticipant', names: 'Sophia Taylor', email: "sophia.taylor.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/5.jpg' },
        { phoneNumber: "250785485910", username: 'danielMooreParticipant', names: 'Daniel Moore', email: "daniel.moore.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/men/6.jpg' },
        { phoneNumber: "250785485101", username: 'miaWhiteParticipant', names: 'Mia White', email: "mia.white.participant@gmail.com", userRole: types_1.UserRole.Participant, profile_url: 'https://randomuser.me/api/portraits/women/6.jpg' },
    ];
    return mockParticipanteUser;
}
;
function convertToISO(date) {
    const formats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'yyyy/MM/dd'];
    let parsedDate;
    for (const fmt of formats) {
        const tempDate = (0, date_fns_1.parse)(date, fmt, new Date());
        if (!isNaN(tempDate.getTime())) {
            parsedDate = tempDate;
            break;
        }
    }
    if (!parsedDate) {
        throw new Error('Invalid date format');
    }
    return (0, date_fns_1.format)(parsedDate, 'yyyy-MM-dd');
}
function getStartDate(endDate, duration) {
    const parsedEndDate = (0, date_fns_1.parse)(endDate, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid end date format');
    }
    const startDate = new Date(parsedEndDate);
    startDate.setDate(parsedEndDate.getDate() - duration);
    return (0, date_fns_1.format)(startDate, 'yyyy-MM-dd');
}
function getDuration(endDate, startDate) {
    const parsedEndDate = (0, date_fns_1.parse)(endDate, 'yyyy-MM-dd', new Date());
    const parsedStartDate = (0, date_fns_1.parse)(startDate, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedEndDate.getTime()) || isNaN(parsedStartDate.getTime())) {
        throw new Error('Invalid date format');
    }
    const duration = parsedEndDate.getTime() - parsedStartDate.getTime();
    return Math.ceil(duration / (1000 * 60 * 60 * 24));
}
const formatResponse = (status, message, data) => ({ status, message, data });
exports.formatResponse = formatResponse;
