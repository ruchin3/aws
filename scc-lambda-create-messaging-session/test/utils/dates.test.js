"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dates_1 = require("../../src/utils/dates");
describe('parseDate', () => {
    test('Extracts the DateParts from a Date object', async () => {
        const year = 2024;
        const month = 7;
        const day = 8;
        const date = new Date(year, month - 1, day); // Note: `month` is 0-indexed for the Date constructor
        const dateParts = (0, dates_1.parseDate)(date);
        expect(dateParts.year).toEqual(year);
        expect(dateParts.month).toEqual(month);
        expect(dateParts.day).toEqual(day);
    });
});
describe('parseEventTime', () => {
    test('Extracts the DateParts from an eventTime string', async () => {
        const eventTime = '2024-07-08T15:04:08Z';
        const dateParts = (0, dates_1.parseEventTime)(eventTime);
        expect(dateParts.year).toEqual(2024);
        expect(dateParts.month).toEqual(7);
        expect(dateParts.day).toEqual(8);
    });
});
//# sourceMappingURL=dates.test.js.map