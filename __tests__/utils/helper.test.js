const { formatResponse, convertToISO, getStartDate } = require('../../src/utils/helper');

describe('helper functions', () => {

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
