"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_secrets_manager_1 = require("./__mocks__/@aws-sdk/client-secrets-manager");
const secretsManager_1 = require("../src/secretsManager");
const secretManagerClient = new client_secrets_manager_1.SecretsManagerClient();
class CustomError extends Error {
}
describe('SecretsManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('putSecretValue', () => {
        it('Puts secret value successfully', async () => {
            client_secrets_manager_1.awsSdkPromiseResponse.mockResolvedValueOnce({});
            await (0, secretsManager_1.putSecretValue)('testSecretId', 'testSecretString');
            expect(secretManagerClient.send).toHaveBeenCalledWith(expect.any(client_secrets_manager_1.PutSecretValueCommand));
        });
        it.each([
            ['ResourceNotFoundException', 'Secret testSecretId does not exists in SecretsManager', new client_secrets_manager_1.ResourceNotFoundException()],
            ['EncryptionFailure', 'Failed to fetch secret testSecretId', new client_secrets_manager_1.EncryptionFailure()],
            ['DecryptionFailure', 'Failed to fetch secret testSecretId', new client_secrets_manager_1.DecryptionFailure()],
            ['InternalServiceError', 'Failed to fetch secret testSecretId', new client_secrets_manager_1.InternalServiceError()],
            ['any other error', 'Something went wrong!', new CustomError('Something went wrong!')],
        ])('Handles %s properly', async (_, errorMessage, exception) => {
            client_secrets_manager_1.awsSdkPromiseResponse.mockImplementationOnce(() => {
                throw exception;
            });
            await expect((0, secretsManager_1.putSecretValue)('testSecretId', 'testSecretString')).rejects.toThrow(errorMessage);
        });
    });
    describe('getSecretValue', () => {
        it('Gets secret value successfully', async () => {
            client_secrets_manager_1.awsSdkPromiseResponse.mockResolvedValue({ SecretString: 'testSecretString' });
            const secret = await (0, secretsManager_1.getSecretValue)('testSecretId');
            expect(secret).toBe('testSecretString');
            expect(secretManagerClient.send).toHaveBeenCalledWith(expect.any(client_secrets_manager_1.GetSecretValueCommand));
        });
        it('Handles missing secret string correctly', async () => {
            client_secrets_manager_1.awsSdkPromiseResponse.mockResolvedValue({});
            await expect((0, secretsManager_1.getSecretValue)('testSecretId')).rejects.toThrow('Value for secret testSecretId not found in Secrets Manager');
        });
        it.each([
            ['ResourceNotFoundException', 'Secret testSecretId does not exists in SecretsManager', new client_secrets_manager_1.ResourceNotFoundException()],
            ['EncryptionFailure', 'Failed to fetch secret testSecretId', new client_secrets_manager_1.EncryptionFailure()],
            ['DecryptionFailure', 'Failed to fetch secret testSecretId', new client_secrets_manager_1.DecryptionFailure()],
            ['InternalServiceError', 'Failed to fetch secret testSecretId', new client_secrets_manager_1.InternalServiceError()],
            ['any other error', 'Something went wrong!', new CustomError('Something went wrong!')],
        ])('Handles %s properly', async (_, errorMessage, exception) => {
            client_secrets_manager_1.awsSdkPromiseResponse.mockImplementationOnce(() => {
                throw exception;
            });
            await expect((0, secretsManager_1.getSecretValue)('testSecretId')).rejects.toThrow(errorMessage);
        });
    });
});
//# sourceMappingURL=secretsManager.test.js.map