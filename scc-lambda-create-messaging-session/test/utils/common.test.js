"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../../src/utils/common");
describe('getEnvironmentVariable', () => {
    process.env.key = 'value';
    it('Correctly returns environment variables', async () => {
        expect((0, common_1.getEnvironmentVariable)('key')).toBe('value');
    });
    it('Throws error when environment variable is not set', async () => {
        expect(() => (0, common_1.getEnvironmentVariable)('other')).toThrow('Environment variable: other is not set');
    });
    it('Trims salesforceId when its length is greater than 15', async () => {
        expect((0, common_1.trimSalesforceId)('123456789012345678')).toBe('123456789012345');
    });
    it('Does not trim salesforceId when its length is equal to 15', async () => {
        expect((0, common_1.trimSalesforceId)('123456789012345')).toBe('123456789012345');
    });
});
//# sourceMappingURL=common.test.js.map