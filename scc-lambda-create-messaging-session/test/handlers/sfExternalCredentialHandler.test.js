"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CredentailHandlers = __importStar(require("../../src/handlers/sfExternalCredentialHandler"));
const auth_1 = require("../../src/utils/auth");
jest.mock('@jsforce/jsforce-node');
jest.mock('../../src/utils/auth');
describe('updateExternalCredentialHandler', () => {
    const mockRequestPatch = jest.fn();
    let mockConnection;
    it('should return success when updated', async () => {
        const externalCredentialName = 'mockExternalCredentialName';
        const certificateName = 'mockCertificateName';
        const testId = 'mockId';
        const event = {
            LogicalResourceId: '',
            RequestId: '',
            RequestType: 'Create',
            ResourceType: '',
            ResponseURL: '',
            ServiceToken: '',
            StackId: '',
            ResourceProperties: {
                CertificateName: certificateName,
                ExternalCredentialName: externalCredentialName,
                ServiceToken: 'mockServiceToken',
            },
        };
        const mockExternalCredential = {
            Id: testId,
            FullName: externalCredentialName,
            Metadata: {
                authenticationProtocol: 'Oauth',
                externalCredentialParameters: [
                    {
                        authProvider: null,
                        certificate: 'SCC_PLACE_HOLDER_CERTIFICATE',
                        description: null,
                        externalAuthIdentityProvider: null,
                        parameterGroup: 'DefaultGroup',
                        parameterName: 'SigningCertificate',
                        parameterType: 'SigningCertificate',
                        parameterValue: null,
                        sequenceNumber: null,
                    },
                    {
                        authProvider: null,
                        certificate: null,
                        description: 'Algorithm',
                        externalAuthIdentityProvider: null,
                        parameterGroup: 'DefaultGroup',
                        parameterName: 'alg',
                        parameterType: 'JwtHeaderClaim',
                        parameterValue: 'RS256',
                        sequenceNumber: null,
                    },
                    {
                        authProvider: null,
                        certificate: null,
                        description: null,
                        externalAuthIdentityProvider: null,
                        parameterGroup: 'DefaultGroup',
                        parameterName: 'kid',
                        parameterType: 'JwtHeaderClaim',
                        parameterValue: 'SCC_PLACE_HOLDER_CERTIFICATE',
                        sequenceNumber: null,
                    },
                ],
                label: 'SCC_GLOBAL_INTERACTION_SERVICE_EC',
            },
        };
        const mockUpdatedExternalCredential = {
            FullName: externalCredentialName,
            Metadata: {
                authenticationProtocol: 'Oauth',
                externalCredentialParameters: [
                    {
                        authProvider: null,
                        certificate: certificateName,
                        description: null,
                        externalAuthIdentityProvider: null,
                        parameterGroup: 'DefaultGroup',
                        parameterName: 'SigningCertificate',
                        parameterType: 'SigningCertificate',
                        parameterValue: null,
                        sequenceNumber: null,
                    },
                    {
                        authProvider: null,
                        certificate: null,
                        description: 'Algorithm',
                        externalAuthIdentityProvider: null,
                        parameterGroup: 'DefaultGroup',
                        parameterName: 'alg',
                        parameterType: 'JwtHeaderClaim',
                        parameterValue: 'RS256',
                        sequenceNumber: null,
                    },
                    {
                        authProvider: null,
                        certificate: null,
                        description: null,
                        externalAuthIdentityProvider: null,
                        parameterGroup: 'DefaultGroup',
                        parameterName: 'kid',
                        parameterType: 'JwtHeaderClaim',
                        parameterValue: certificateName,
                        sequenceNumber: null,
                    },
                ],
                label: 'SCC_GLOBAL_INTERACTION_SERVICE_EC',
            },
        };
        auth_1.getExternalCredential.mockReturnValue(mockExternalCredential);
        mockConnection = {
            requestPatch: mockRequestPatch,
        };
        auth_1.generateSFConnection.mockReturnValue(mockConnection);
        mockRequestPatch.mockResolvedValue(null);
        const result = await CredentailHandlers.updateExternalCredentialHandler(event);
        expect(result.status).toEqual('SUCCESS');
        expect(auth_1.getExternalCredential).toHaveBeenCalledWith(mockConnection, externalCredentialName);
        expect(mockRequestPatch).toHaveBeenCalledWith(`/services/data/v61.0/tooling/sobjects/ExternalCredential/${testId}`, mockUpdatedExternalCredential);
    });
    it('should throw error when no external credential found', async () => {
        const externalCredentialName = 'mockExternalCredentialName';
        const certificateName = 'mockCertificateName';
        const event = {
            LogicalResourceId: '',
            RequestId: '',
            RequestType: 'Create',
            ResourceType: '',
            ResponseURL: '',
            ServiceToken: '',
            StackId: '',
            ResourceProperties: {
                CertificateName: certificateName,
                ExternalCredentialName: externalCredentialName,
                ServiceToken: 'mockServiceToken',
            },
        };
        auth_1.getExternalCredential.mockReturnValue(null);
        mockConnection = {
            requestPatch: mockRequestPatch,
        };
        auth_1.generateSFConnection.mockReturnValue(mockConnection);
        let error;
        try {
            await CredentailHandlers.updateExternalCredentialHandler(event);
        }
        catch (e) {
            error = e;
        }
        expect(error?.message.includes('No External Credential found with the specified name mockExternalCredentialName')).toBeTruthy();
        expect(auth_1.getExternalCredential).toHaveBeenCalledWith(mockConnection, externalCredentialName);
        expect(mockRequestPatch).not.toHaveBeenCalled();
    });
    it('should return success when deleted', async () => {
        const externalCredentialName = 'mockExternalCredentialName';
        const certificateName = 'mockCertificateName';
        const event = {
            LogicalResourceId: '',
            RequestId: '',
            RequestType: 'Delete',
            ResourceType: '',
            ResponseURL: '',
            ServiceToken: '',
            StackId: '',
            ResourceProperties: {
                CertificateName: certificateName,
                ExternalCredentialName: externalCredentialName,
                ServiceToken: 'mockServiceToken',
            },
            PhysicalResourceId: '',
        };
        const result = await CredentailHandlers.updateExternalCredentialHandler(event);
        expect(result.status).toEqual('SUCCESS');
        expect(auth_1.getExternalCredential).not.toHaveBeenCalled();
    });
    it('should throw error when unknown event', async () => {
        const externalCredentialName = 'mockExternalCredentialName';
        const certificateName = 'mockCertificateName';
        const event = {
            LogicalResourceId: '',
            RequestId: '',
            RequestType: 'Update',
            ResourceType: '',
            ResponseURL: '',
            ServiceToken: '',
            StackId: '',
            ResourceProperties: {
                CertificateName: certificateName,
                ExternalCredentialName: externalCredentialName,
                ServiceToken: 'mockServiceToken',
            },
            PhysicalResourceId: '',
            OldResourceProperties: {},
        };
        let error;
        try {
            await CredentailHandlers.updateExternalCredentialHandler(event);
        }
        catch (e) {
            error = e;
        }
        expect(error?.message.includes('Unsupported request type:')).toBeTruthy();
        expect(auth_1.getExternalCredential).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=sfExternalCredentialHandler.test.js.map