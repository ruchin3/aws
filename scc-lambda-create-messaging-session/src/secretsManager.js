"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putSecretValue = exports.getSecretValue = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const client = new client_secrets_manager_1.SecretsManagerClient({ region: process.env.AWS_REGION });
/**
 * Client implementation for SecretsManager - PutSecretValue API.
 * https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_PutSecretValue.html
 */
async function putSecretValue(secretId, secretString) {
    console.log(`Attempting to put secret: ${secretId} in Secrets Manager`);
    try {
        const command = new client_secrets_manager_1.PutSecretValueCommand({
            SecretId: secretId,
            SecretString: secretString,
        });
        await client.send(command);
        console.log(`Successfully put secret: ${secretId} in Secrets Manager`);
    }
    catch (err) {
        throw translateError(err, [secretId]);
    }
}
exports.putSecretValue = putSecretValue;
/**
 * Client implementation for SecretsManager - GetSecretValue API.
 * https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
 */
async function getSecretValue(secretId) {
    console.log(`Attempting to retrieve secret value: ${secretId} from Secrets Manager`);
    try {
        const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: secretId });
        const response = await client.send(command);
        // This check is required because secrets manager supports both binary and
        // text based format for secrets value. All SCC secrets are text based, so we need to
        // add this additional check to ensure we did get a correct value back.
        if (!response.SecretString) {
            throw new Error(`Value for secret ${secretId} not found in Secrets Manager`);
        }
        console.log(`Successfully retrieved secret: ${secretId}`);
        return response.SecretString;
    }
    catch (err) {
        throw translateError(err, [secretId]);
    }
}
exports.getSecretValue = getSecretValue;
function translateError(err, secretIds) {
    if (err instanceof client_secrets_manager_1.ResourceNotFoundException) {
        return new Error(`Secret ${secretIds.join(', ')} does not exists in SecretsManager`);
    }
    else if (err instanceof client_secrets_manager_1.DecryptionFailure || err instanceof client_secrets_manager_1.EncryptionFailure || err instanceof client_secrets_manager_1.InternalServiceError) {
        return new Error(`Failed to fetch secret ${secretIds.join(', ')}`);
    }
    return err;
}
//# sourceMappingURL=secretsManager.js.map