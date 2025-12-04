"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.isAxiosError = void 0;
const axios = jest.genMockFromModule('axios');
exports.isAxiosError = jest.fn((error) => error.isAxiosError);
exports.create = jest.fn(() => ({
    post: jest.fn(),
}));
exports.default = axios;
//# sourceMappingURL=axios.js.map