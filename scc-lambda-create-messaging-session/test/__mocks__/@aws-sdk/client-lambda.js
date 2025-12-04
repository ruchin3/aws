"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lambda = exports.invokeMock = void 0;
exports.invokeMock = jest.fn();
class Lambda {
    invoke = exports.invokeMock;
}
exports.Lambda = Lambda;
//# sourceMappingURL=client-lambda.js.map