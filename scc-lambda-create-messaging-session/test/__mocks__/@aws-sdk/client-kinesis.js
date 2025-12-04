"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kinesis = exports.getRecordsMock = exports.getShardIteratorMock = void 0;
exports.getShardIteratorMock = jest.fn();
exports.getRecordsMock = jest.fn();
class Kinesis {
    getShardIterator = exports.getShardIteratorMock;
    getRecords = exports.getRecordsMock;
}
exports.Kinesis = Kinesis;
//# sourceMappingURL=client-kinesis.js.map