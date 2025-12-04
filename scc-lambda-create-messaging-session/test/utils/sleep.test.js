"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleep_1 = require("../../src/utils/sleep");
describe('sleep', () => {
    test('Resolves after 1 second', async () => {
        const start = Date.now();
        await (0, sleep_1.sleep)(1_000);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(1_000);
    });
});
//# sourceMappingURL=sleep.test.js.map