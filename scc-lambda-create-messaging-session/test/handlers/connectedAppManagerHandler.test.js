"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connectedAppManagerHandler_1 = require("../../src/handlers/connectedAppManagerHandler");
const secretsManager_1 = require("../../src/secretsManager");
const common_1 = require("../../src/utils/common");
const constants_1 = require("../../src/utils/constants");
const axios_1 = __importDefault(require("axios"));
// Mock the imported modules
jest.mock('../../src/secretsManager');
jest.mock('../../src/utils/common');
jest.mock('axios');
const mockedAxios = axios_1.default;
// Mock the handler functions
const mockReadConnectedAppHandler = jest.fn();
const mockUpdateConnectedAppWithCertificateHandler = jest.fn();
jest.mock('../../src/handlers/sfResourceCreationHandler', () => ({
    readConnectedAppHandler: (...args) => mockReadConnectedAppHandler(...args),
    updateConnectedAppWithCertificateHandler: (...args) => mockUpdateConnectedAppWithCertificateHandler(...args),
}));
describe('should handle Create request type', () => {
    const mockSecretValue = JSON.stringify({
        [constants_1.CONSUMER_KEY]: 'testConsumerKey',
        [constants_1.CONSUMER_SECRET]: 'testConsumerSecret',
        [constants_1.CERT_PUBLIC_KEY]: 'testCertPublicKey',
    });
    const mockDomainUrl = 'https://test.salesforce.com';
    const mockConnectedAppName = 'TestConnectedApp';
    beforeEach(() => {
        jest.clearAllMocks();
        secretsManager_1.getSecretValue.mockResolvedValue(mockSecretValue);
        common_1.getEnvironmentVariable.mockImplementation((key) => {
            if (key === constants_1.SECRET_ENV_VAR_KEY)
                return 'testSecretKey';
            if (key === constants_1.AUTH_DOMAIN_URL)
                return mockDomainUrl;
            return null;
        });
        mockedAxios.put.mockResolvedValue({ status: 200 });
    });
    it('should read connected app when action is READ_CONNECTED_APP_ACTION', async () => {
        const mockConnectedApp = { name: mockConnectedAppName, id: 'testId' };
        const mockEvent = {
            RequestType: 'Create',
            RequestId: 'testRequestId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            ResourceProperties: {
                ConnectedAppAPIName: mockConnectedAppName,
                ConnectedAppAction: 'Read',
            },
        };
        mockReadConnectedAppHandler.mockResolvedValue(mockConnectedApp);
        await (0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent);
        expect(mockReadConnectedAppHandler).toHaveBeenCalledWith(mockDomainUrl, 'testConsumerKey', 'testConsumerSecret', mockConnectedAppName);
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: ',
            PhysicalResourceId: 'testRequestId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: { connectedApp: mockConnectedApp },
        });
    });
    it('should update and read connected app when action is UPDATE_CONNECTED_APP_ACTION', async () => {
        const mockUpdatedConnectedApp = { name: mockConnectedAppName, id: 'testId', updatedField: 'updatedValue' };
        mockUpdateConnectedAppWithCertificateHandler.mockResolvedValue(undefined);
        mockReadConnectedAppHandler.mockResolvedValue(mockUpdatedConnectedApp);
        const mockEvent = {
            RequestType: 'Create',
            RequestId: 'testRequestId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            ResourceProperties: {
                ConnectedAppAPIName: mockConnectedAppName,
                ConnectedAppAction: 'Update',
            },
        };
        mockReadConnectedAppHandler.mockResolvedValue(mockUpdatedConnectedApp);
        await (0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent);
        expect(mockUpdateConnectedAppWithCertificateHandler).toHaveBeenCalledWith(mockDomainUrl, 'testConsumerKey', 'testConsumerSecret', mockConnectedAppName, 'testCertPublicKey');
        expect(mockReadConnectedAppHandler).toHaveBeenCalledWith(mockDomainUrl, 'testConsumerKey', 'testConsumerSecret', mockConnectedAppName);
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: ',
            PhysicalResourceId: 'testRequestId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: { connectedApp: mockUpdatedConnectedApp },
        });
    });
    it('should throw an error for invalid action', async () => {
        await expect((0, connectedAppManagerHandler_1.readUpdateConnectedApp)(mockConnectedAppName, 'InvalidAction')).rejects.toThrow("Unexpected operation to connectedAppManagerHandler, only valid actions are 'Read' and 'Update'");
        const mockEvent = {
            RequestType: 'Create',
            RequestId: 'testRequestId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            ResourceProperties: {
                ConnectedAppAPIName: mockConnectedAppName,
                ConnectedAppAction: 'InvalidAction',
            },
        };
        await expect((0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent)).rejects.toThrow("Unexpected operation to connectedAppManagerHandler, only valid actions are 'Read' and 'Update'");
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'FAILED',
            Reason: 'See the details in CloudWatch Log Stream: ',
            PhysicalResourceId: 'testRequestId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: undefined,
        });
    });
    it('should throw an error when reading/updating connected app fails', async () => {
        const mockError = new Error('Read failed');
        const mockEvent = {
            RequestType: 'Create',
            RequestId: 'testRequestId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            ResourceProperties: {
                ConnectedAppAPIName: mockConnectedAppName,
                ConnectedAppAction: 'Read',
            },
        };
        mockReadConnectedAppHandler.mockRejectedValue(mockError);
        await expect((0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent)).rejects.toThrow(mockError);
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'FAILED',
            Reason: 'See the details in CloudWatch Log Stream: ',
            PhysicalResourceId: 'testRequestId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: undefined,
        });
    });
});
describe('Should handle Update request type', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.put.mockResolvedValue({ status: 200 });
    });
    it('happy path', async () => {
        const mockEvent = {
            RequestType: 'Update',
            RequestId: 'testRequestId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            PhysicalResourceId: 'testPhysicalId',
            ResourceProperties: {
                ConnectedAppAPIName: 'testApp',
                ConnectedAppAction: 'Read',
            },
        };
        await (0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent);
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: ',
            PhysicalResourceId: 'testPhysicalId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: {},
        });
    });
});
describe('should handle Delete request type', () => {
    it('happy path', async () => {
        const mockEvent = {
            RequestType: 'Delete',
            RequestId: 'testRequestId',
            PhysicalResourceId: 'testPhysicalId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            ResourceProperties: {
                ConnectedAppAPIName: 'testApp',
                ConnectedAppAction: 'Read',
            },
        };
        await (0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent);
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: ',
            PhysicalResourceId: 'testPhysicalId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: undefined,
        });
    });
});
describe('should handle errors', () => {
    it('should handle unsupported request type', async () => {
        const mockEvent = {
            RequestType: 'Unsupported',
            RequestId: 'testRequestId',
            ResponseURL: 'https://test-url.com',
            StackId: 'testStackId',
            LogicalResourceId: 'testLogicalId',
            ResourceProperties: {
                ConnectedAppAPIName: 'testApp',
                ConnectedAppAction: 'Read',
            },
        };
        await expect((0, connectedAppManagerHandler_1.connectedAppManagerHandler)(mockEvent)).rejects.toThrow('Unsupported request type: Unsupported');
        expect(mockedAxios.put).toHaveBeenCalledWith('https://test-url.com', {
            Status: 'FAILED',
            Reason: 'Unsupported request type: Unsupported',
            PhysicalResourceId: 'testRequestId',
            StackId: 'testStackId',
            RequestId: 'testRequestId',
            LogicalResourceId: 'testLogicalId',
            Data: {},
        });
    });
});
//# sourceMappingURL=connectedAppManagerHandler.test.js.map