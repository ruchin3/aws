"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const interactionService_1 = require("../src/interactionService");
const common_1 = require("../src/utils/common");
const auth_1 = require("../src/utils/auth");
const constants_1 = require("../src/utils/constants");
jest.mock('../src/utils/auth');
jest.mock('../src/secretsManager');
jest.mock('../src/utils/common');
jest.mock('../src/utils/sleep');
jest.mock('uuid', () => ({
    v4: jest.fn(),
}));
describe('routeWorkItem', () => {
    const mockToken = 'test-token';
    const mockData = { key: 'value' };
    const mockBaseURL = 'https://mock-url.com';
    const mockOrgId = 'mock-org-id';
    const mockRequestId = 'mock-request-id';
    let axiosInstance;
    let mockPost;
    beforeEach(() => {
        jest.clearAllMocks();
        common_1.getEnvironmentVariable.mockReturnValue(mockBaseURL);
        common_1.getSalesforceOrganizationId.mockReturnValue(mockOrgId);
        uuid_1.v4.mockReturnValue(mockRequestId);
        auth_1.fetchAccessToken.mockResolvedValue(mockToken);
        mockPost = jest.fn();
        axiosInstance = {
            post: mockPost,
        };
        axios_1.default.create.mockReturnValue(axiosInstance);
    });
    it('Successfully routes work item', async () => {
        // @ts-ignore
        const mockResponse = {
            data: { success: true },
            status: 200,
            statusText: 'OK',
            headers: {},
        };
        mockPost.mockResolvedValue(mockResponse);
        const response = await (0, interactionService_1.routeWorkItem)(mockData);
        expect(axios_1.default.create).toHaveBeenCalledWith({
            baseURL: mockBaseURL,
        });
        expect(common_1.getSalesforceOrganizationId).toHaveBeenCalled();
        expect(uuid_1.v4).toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledWith('/api/v1/route', mockData, {
            headers: {
                'Content-Type': 'application/json',
                OrgId: mockOrgId,
                AuthorizationContext: constants_1.SALESFORCE_INTERACTION_SERVICE_AUTHORIZATION_CONTEXT,
                Authorization: 'Bearer ' + mockToken,
                RequestId: mockRequestId,
            },
        });
        expect(response).toBe(mockResponse);
    });
    it('Handles errors when routing work item', async () => {
        const mockError = new Error('Error');
        mockPost.mockRejectedValue(mockError);
        await expect((0, interactionService_1.routeWorkItem)(mockData)).rejects.toThrow('Error');
        expect(axios_1.default.create).toHaveBeenCalledWith({
            baseURL: mockBaseURL,
        });
        expect(common_1.getSalesforceOrganizationId).toHaveBeenCalled();
        expect(uuid_1.v4).toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockPost).toHaveBeenCalledWith('/api/v1/route', mockData, {
            headers: {
                'Content-Type': 'application/json',
                OrgId: mockOrgId,
                AuthorizationContext: constants_1.SALESFORCE_INTERACTION_SERVICE_AUTHORIZATION_CONTEXT,
                Authorization: 'Bearer ' + mockToken,
                RequestId: mockRequestId,
            },
        });
    });
    it.each([
        ['401', 401],
        ['403', 403],
        ['500', 500],
    ])('Retries on token expiry and route work item successfully on %s', async (_, status) => {
        // @ts-ignore
        const mockResponse = {
            data: { success: true, psrId: 'mock-psr-id' },
            status: 200,
            statusText: 'OK',
            headers: {},
        };
        const errorResponse = {
            response: {
                status: status,
            },
            isAxiosError: true,
        };
        mockPost.mockRejectedValueOnce(errorResponse).mockResolvedValue(mockResponse);
        let response = await (0, interactionService_1.routeWorkItem)(mockData);
        expect(axios_1.default.create).toHaveBeenCalledWith({
            baseURL: mockBaseURL,
        });
        expect(common_1.getSalesforceOrganizationId).toHaveBeenCalled();
        expect(uuid_1.v4).toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledTimes(2);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
    });
    it.each([
        ['401', 401],
        ['403', 403],
        ['500', 500],
    ])('Retries on token expiry and create messaging session successfully on %s', async (_, status) => {
        // @ts-ignore
        const mockResponse = {
            data: { success: true, psrId: 'mock-psr-id' },
            status: 200,
            statusText: 'OK',
            headers: {},
        };
        const errorResponse = {
            response: {
                status: status,
            },
            isAxiosError: true,
        };
        mockPost.mockRejectedValueOnce(errorResponse).mockResolvedValue(mockResponse);
        // @ts-ignore
        let response = await (0, interactionService_1.interactionsRequest)(mockData);
        expect(axios_1.default.create).toHaveBeenCalledWith({
            baseURL: mockBaseURL,
        });
        expect(common_1.getSalesforceOrganizationId).toHaveBeenCalled();
        expect(uuid_1.v4).toHaveBeenCalled();
        expect(mockPost).toHaveBeenCalledTimes(2);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
    });
});
//# sourceMappingURL=interactionService.test.js.map