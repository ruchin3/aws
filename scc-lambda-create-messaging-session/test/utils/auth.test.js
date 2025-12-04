"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../src/utils/auth");
const secretsManager_1 = require("../../src/secretsManager");
const constants_1 = require("../../src/utils/constants");
const axios_1 = __importDefault(require("axios"));
const common_1 = require("../../src/utils/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
jest.mock('../../src/secretsManager');
jest.mock('../../src/utils/common');
jest.mock('jsonwebtoken');
jest.mock('axios');
jest.mock('@jsforce/jsforce-node');
const mockSecretsJson = {
    [constants_1.CONSUMER_KEY]: 'mockConsumerKey',
    [constants_1.CERT_PRIVATE_KEY]: 'mockPrivateKey',
    [constants_1.API_USER]: 'mockApiUser',
    [constants_1.CONSUMER_SECRET]: 'mockConsumerSecret',
};
const mockSecrets = JSON.stringify(mockSecretsJson);
const mockJwt = 'test-jwt';
const mockAccessToken = 'test-access-token';
describe('fetchAccessToken', () => {
    let axiosInstance;
    let mockPost;
    beforeEach(() => {
        jest.clearAllMocks();
        mockPost = jest.fn();
        axiosInstance = {
            post: mockPost,
        };
        axios_1.default.create.mockReturnValue(axiosInstance);
    });
    it('Returns the access token if it is present in secrets manager', async () => {
        secretsManager_1.getSecretValue.mockResolvedValue(mockAccessToken);
        const result = await (0, auth_1.fetchAccessToken)();
        expect(result).toBe(mockAccessToken);
        expect(secretsManager_1.getSecretValue).toHaveBeenCalledWith((0, common_1.getEnvironmentVariable)(constants_1.ACCESS_TOKEN_SECRET));
    });
    it('should handle errors from getSecretValue and call refreshAccessToken', async () => {
        // Arrange
        const mockError = new Error('Secret not found');
        jsonwebtoken_1.default.sign.mockReturnValue(mockJwt);
        mockPost.mockResolvedValue({ data: { access_token: mockAccessToken } });
        secretsManager_1.putSecretValue.mockResolvedValue(undefined);
        // (getSecretValue as jest.Mock).mockReturnValue(mockError);
        secretsManager_1.getSecretValue.mockImplementationOnce(() => {
            throw mockError;
        });
        secretsManager_1.getSecretValue.mockResolvedValue(mockSecrets);
        // Act
        const result = await (0, auth_1.fetchAccessToken)();
        // Assert
        expect(result).toBe(mockAccessToken);
    });
});
describe('refreshAccessToken', () => {
    let axiosInstance;
    let mockPost;
    beforeEach(() => {
        jest.clearAllMocks();
        mockPost = jest.fn();
        axiosInstance = {
            post: mockPost,
        };
        axios_1.default.create.mockReturnValue(axiosInstance);
    });
    it('Refreshes and returns a new access token', async () => {
        secretsManager_1.getSecretValue.mockResolvedValue(mockSecrets);
        jsonwebtoken_1.default.sign.mockReturnValue(mockJwt);
        mockPost.mockResolvedValue({ data: { access_token: mockAccessToken } });
        secretsManager_1.putSecretValue.mockResolvedValue(undefined);
        const result = await (0, auth_1.refreshAccessToken)();
        expect(result).toBe(mockAccessToken);
        expect(secretsManager_1.getSecretValue).toHaveBeenCalledWith((0, common_1.getEnvironmentVariable)(constants_1.SECRET_ENV_VAR_KEY));
        expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({
            iss: mockSecretsJson[constants_1.CONSUMER_KEY],
            sub: mockSecretsJson[constants_1.API_USER],
            aud: (0, common_1.getEnvironmentVariable)(constants_1.AUD),
        }, mockSecretsJson[constants_1.CERT_PRIVATE_KEY], expect.objectContaining({
            algorithm: 'RS256',
            expiresIn: expect.any(Number),
            jwtid: expect.any(String),
        }));
        expect(secretsManager_1.putSecretValue).toHaveBeenCalledWith((0, common_1.getEnvironmentVariable)(constants_1.ACCESS_TOKEN_SECRET), mockAccessToken);
    });
    it('Returns access token when it fails to update token in secrets manager', async () => {
        secretsManager_1.getSecretValue.mockResolvedValue(mockSecrets);
        jsonwebtoken_1.default.sign.mockReturnValue(mockJwt);
        mockPost.mockResolvedValue({ data: { access_token: mockAccessToken } });
        secretsManager_1.putSecretValue.mockRejectedValue(new Error('Failed to put secret'));
        const result = await (0, auth_1.refreshAccessToken)();
        expect(result).toBe(mockAccessToken);
    });
    it('Throws an error if request to generate access token fails', async () => {
        secretsManager_1.getSecretValue.mockResolvedValue(mockSecrets);
        jsonwebtoken_1.default.sign.mockReturnValue(mockJwt);
        mockPost.mockRejectedValue({
            response: {
                status: 500,
            },
            isAxiosError: true,
        });
        await expect((0, auth_1.refreshAccessToken)()).rejects.toThrow('Request to generate access token failed');
    });
});
describe('generateSFConnection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('Should generate a Salesforce connection and return', async () => {
        common_1.getEnvironmentVariable.mockReturnValue('test secret');
        secretsManager_1.getSecretValue.mockResolvedValue(mockSecrets);
        await (0, auth_1.generateSFConnection)();
        expect(common_1.getEnvironmentVariable).toHaveBeenCalledWith(constants_1.SECRET_ENV_VAR_KEY);
        expect(secretsManager_1.getSecretValue).toHaveBeenCalledWith('test secret');
        expect(common_1.getEnvironmentVariable).toHaveBeenCalledWith(constants_1.AUTH_DOMAIN_URL);
    });
});
//# sourceMappingURL=auth.test.js.map