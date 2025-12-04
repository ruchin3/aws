"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./__mocks__/@jsforce/jsforce-node/lib/connection");
const sfResourceCreationHandler_1 = require("../src/handlers/sfResourceCreationHandler");
jest.mock('@jsforce/jsforce-node/lib/connection');
describe('readConnectedAppHandler', () => {
    const mockAuthorize = jest.fn();
    const mockMetadataRead = jest.fn();
    beforeEach(() => {
        connection_1.Connection.mockImplementation(() => ({
            authorize: mockAuthorize,
            metadata: { read: mockMetadataRead },
        }));
    });
    it('should return connected app details when found', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        const mockConnectedApp = {
            fullName: connectedAppName,
            label: 'Test App',
            contactEmail: 'admin@example.com',
            oauthConfig: {
                callbackUrl: 'https://example.com',
                scopes: ['RefreshToken', 'Interaction'],
                certificate: 'certContent',
                consumerKey: 'mockConsumerKey',
            },
            profileName: ['System Administrator'],
        };
        mockAuthorize.mockResolvedValue({});
        mockMetadataRead.mockResolvedValue([mockConnectedApp]);
        const result = await (0, sfResourceCreationHandler_1.readConnectedAppHandler)(domainURL, clientId, clientSecret, connectedAppName);
        expect(result).toEqual(mockConnectedApp);
    });
    it('should return null when connected app not found', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'nonExistingAppName';
        mockAuthorize.mockResolvedValue({});
        mockMetadataRead.mockResolvedValue([]);
        await expect((0, sfResourceCreationHandler_1.readConnectedAppHandler)(domainURL, clientId, clientSecret, connectedAppName)).rejects.toThrow('No Connected App found with the specified name.');
    });
    it('should handle errors gracefully', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        mockAuthorize.mockRejectedValue(new Error('Authorization failed'));
        await expect((0, sfResourceCreationHandler_1.readConnectedAppHandler)(domainURL, clientId, clientSecret, connectedAppName)).rejects.toThrow('Authorization failed');
    });
});
describe('updateConnectedAppWithCertificateHandler', () => {
    const mockAuthorize = jest.fn();
    const mockMetadataRead = jest.fn();
    const mockMetadataUpdate = jest.fn();
    beforeEach(() => {
        connection_1.Connection.mockImplementation(() => ({
            authorize: mockAuthorize,
            metadata: { read: mockMetadataRead, update: mockMetadataUpdate },
        }));
    });
    it('should update the connected app certificate successfully', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        const newCertificate = 'newCertContent';
        const mockConnectedApp = {
            fullName: connectedAppName,
            label: 'Test App',
            contactEmail: 'admin@example.com',
            oauthConfig: {
                callbackUrl: 'https://example.com',
                scopes: ['RefreshToken', 'Interaction'],
                certificate: 'oldCertContent',
                consumerKey: 'mockConsumerKey',
            },
            profileName: ['System Administrator'],
        };
        mockAuthorize.mockResolvedValue({});
        mockMetadataRead.mockResolvedValue([mockConnectedApp]);
        mockMetadataUpdate.mockResolvedValue({ success: true });
        await (0, sfResourceCreationHandler_1.updateConnectedAppWithCertificateHandler)(domainURL, clientId, clientSecret, connectedAppName, newCertificate);
        expect(mockMetadataUpdate).toHaveBeenCalledWith('ConnectedApp', {
            ...mockConnectedApp,
            oauthConfig: { ...mockConnectedApp.oauthConfig, certificate: newCertificate },
        });
    });
    it('should throw error if connected app failed to update', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        const newCertificate = 'newCertContent';
        const mockConnectedApp = {
            fullName: connectedAppName,
            label: 'Test App',
            contactEmail: 'admin@example.com',
            oauthConfig: {
                callbackUrl: 'https://example.com',
                scopes: ['RefreshToken', 'Interaction'],
                certificate: 'oldCertContent',
                consumerKey: 'mockConsumerKey',
            },
            profileName: ['System Administrator'],
        };
        mockAuthorize.mockResolvedValue({});
        mockMetadataRead.mockResolvedValue([mockConnectedApp]);
        mockMetadataUpdate.mockResolvedValue({ success: false });
        await expect((0, sfResourceCreationHandler_1.updateConnectedAppWithCertificateHandler)(domainURL, clientId, clientSecret, connectedAppName, newCertificate)).rejects.toThrow('Failed to update ConnectedApp with new Certificate');
    });
    it('should handle cases where the connected app is not found', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'nonExistingAppName';
        const newCertificate = 'newCertContent';
        mockAuthorize.mockResolvedValue({});
        mockMetadataRead.mockResolvedValue([]);
        await expect((0, sfResourceCreationHandler_1.updateConnectedAppWithCertificateHandler)(domainURL, clientId, clientSecret, connectedAppName, newCertificate)).rejects.toThrow('No Connected App found with the specified name.');
    });
    it('should handle errors gracefully', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        const newCertificate = 'newCertContent';
        mockAuthorize.mockResolvedValue({});
        mockMetadataRead.mockResolvedValue([{ fullName: connectedAppName, oauthConfig: {} }]);
        mockMetadataUpdate.mockRejectedValue(new Error('Update failed'));
        await expect((0, sfResourceCreationHandler_1.updateConnectedAppWithCertificateHandler)(domainURL, clientId, clientSecret, connectedAppName, newCertificate)).rejects.toThrow('Update failed');
    });
});
describe('createConnectedAppForInteractionApiHandler', () => {
    const mockAuthorize = jest.fn();
    const mockMetadataCreate = jest.fn();
    beforeEach(() => {
        connection_1.Connection.mockImplementation(() => ({
            authorize: mockAuthorize,
            metadata: { create: mockMetadataCreate },
        }));
    });
    it('should create a connected app successfully', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        const adminEmail = 'admin@example.com';
        const certificateContent = 'certContent';
        const mockConnectedAppResult = { success: true };
        mockAuthorize.mockResolvedValue({});
        mockMetadataCreate.mockResolvedValue(mockConnectedAppResult);
        await (0, sfResourceCreationHandler_1.createConnectedAppForInteractionApiHandler)(domainURL, clientId, clientSecret, connectedAppName, adminEmail, certificateContent);
        expect(mockMetadataCreate).toHaveBeenCalledWith('ConnectedApp', {
            fullName: connectedAppName,
            label: connectedAppName,
            contactEmail: adminEmail,
            oauthConfig: {
                callbackUrl: 'https://salesforce.com',
                scopes: ['RefreshToken', 'Interaction'],
                certificate: certificateContent,
                consumerKey: expect.any(String),
                isAdminApproved: true,
                isClientCredentialEnabled: false,
                isCodeCredentialEnabled: false,
                isCodeCredentialPostOnly: false,
                isConsumerSecretOptional: false,
                isIntrospectAllTokens: false,
                isNamedUserJwtEnabled: true,
                isPkceRequired: true,
                isRefreshTokenRotationEnabled: false,
                isSecretRequiredForRefreshToken: true,
                isSecretRequiredForTokenExchange: false,
                isTokenExchangeEnabled: false,
            },
            oauthPolicy: {
                ipRelaxation: 'ENFORCE',
                refreshTokenPolicy: 'infinite',
            },
            profileName: ['System Administrator'],
        });
    });
    it('should handle errors gracefully', async () => {
        const domainURL = 'https://example.salesforce.com';
        const clientId = 'mockClientId';
        const clientSecret = 'mockClientSecret';
        const connectedAppName = 'awsac__ConnectedAppName';
        const adminEmail = 'admin@example.com';
        const certificateContent = 'certContent';
        mockAuthorize.mockResolvedValue({});
        mockMetadataCreate.mockRejectedValue(new Error('Creation failed'));
        await expect((0, sfResourceCreationHandler_1.createConnectedAppForInteractionApiHandler)(domainURL, clientId, clientSecret, connectedAppName, adminEmail, certificateContent)).rejects.toThrow('Creation failed');
    });
});
//# sourceMappingURL=SFResourceCreation.test.js.map