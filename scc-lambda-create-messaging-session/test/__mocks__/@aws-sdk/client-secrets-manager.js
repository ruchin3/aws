"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServiceError = exports.EncryptionFailure = exports.DecryptionFailure = exports.ResourceNotFoundException = exports.PutSecretValueCommand = exports.GetSecretValueCommand = exports.SecretsManagerClient = exports.awsSdkPromiseResponse = void 0;
exports.awsSdkPromiseResponse = jest.fn();
const sendCommandFn = jest.fn().mockImplementation(() => (0, exports.awsSdkPromiseResponse)());
class SecretsManagerClient {
    send = sendCommandFn;
}
exports.SecretsManagerClient = SecretsManagerClient;
class GetSecretValueCommand {
    input;
    constructor(input) {
        this.input = input;
    }
}
exports.GetSecretValueCommand = GetSecretValueCommand;
class PutSecretValueCommand {
    input;
    constructor(input) {
        this.input = input;
    }
}
exports.PutSecretValueCommand = PutSecretValueCommand;
class ResourceNotFoundException {
}
exports.ResourceNotFoundException = ResourceNotFoundException;
class DecryptionFailure {
}
exports.DecryptionFailure = DecryptionFailure;
class EncryptionFailure {
}
exports.EncryptionFailure = EncryptionFailure;
class InternalServiceError {
}
exports.InternalServiceError = InternalServiceError;
exports.default = jest.fn().mockImplementation(() => {
    return {
        SecretsManagerClient,
        GetSecretValueCommand,
        PutSecretValueCommand,
        ResourceNotFoundException,
        DecryptionFailure,
        EncryptionFailure,
    };
});
//# sourceMappingURL=client-secrets-manager.js.map