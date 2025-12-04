"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrentQueue = void 0;
class ConcurrentQueue {
    enqueue = jest.fn();
    process = jest.fn().mockImplementation(() => []);
}
exports.ConcurrentQueue = ConcurrentQueue;
//# sourceMappingURL=async-utils.js.map