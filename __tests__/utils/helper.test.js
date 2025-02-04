const { mockAdminUser, mockParticipanteUser, formatResponse,convertToISO, getStartDate} = require('../../src/utils/helper');

describe('helper functions', () => {
    describe('mockAdminUser', () => {
        it('should return a user payload for a given id', () => {
            const user = mockAdminUser('679f2df529592efbf6df223a');
            expect(user).toEqual({
                id: '679f2df529592efbf6df223a',
                username: 'johnDoeAdmin',
                names: 'Johnathan Doe',
                email: 'john.doe.admin@gmail.com',
                userRole: 'admin',
                profile_url: 'https://randomuser.me/api/portraits/men/1.jpg'
            });
        });

        it('should return undefined if the id does not exist', () => {
            expect(mockAdminUser('1234567890')).toBeUndefined();
        });
    });

    describe('mockParticipanteUser', () => {
        it('should return a user payload for a given id', () => {
            const user = mockParticipanteUser('679f2df529592efbf6df223c');
            expect(user).toEqual({
                id: '679f2df529592efbf6df223c',
                username: 'johnDoeParticipant',
                names: 'Johnny Doe',
                email: 'john.doe.participant@gmail.com',
                userRole: 'participant',
                profile_url: 'https://randomuser.me/api/portraits/men/2.jpg'
            });
        });

        it('should return undefined if the id does not exist', () => {
            expect(mockParticipanteUser('1234567890')).toBeUndefined();
        });
    });

    describe('formatResponse', () => {
        it('should return a formatted response object', () => {
            const response = formatResponse('success', 'data');
            expect(response).toEqual({ status: 'success', message: 'data' });
        });
    });

    describe('convertToISO', () => {
        it('should convert a date string to ISO format', () => {
            const date = '01/01/2022';
            const isoDate = convertToISO(date);
            expect(isoDate).toBe('2022-01-01');
        });
    });

    describe('getStartDate', () => {
        it('should return a start date for a given end date and duration', () => {
            const endDate = '2022-01-01';
            const duration = 7;
            const startDate = getStartDate(endDate, duration);
            expect(startDate).toBe('2021-12-25');
        });
    });
});
