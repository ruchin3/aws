"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServiceError = exports.ResourceNotFoundError = exports.EnvironmentError = exports.LambdaRequestValidationError = void 0;
class LambdaRequestValidationError extends Error {
}
exports.LambdaRequestValidationError = LambdaRequestValidationError;
class EnvironmentError extends Error {
}
exports.EnvironmentError = EnvironmentError;
class ResourceNotFoundError extends Error {
}
exports.ResourceNotFoundError = ResourceNotFoundError;
class InternalServiceError extends Error {
}
exports.InternalServiceError = InternalServiceError;
//# sourceMappingURL=errors.js.map