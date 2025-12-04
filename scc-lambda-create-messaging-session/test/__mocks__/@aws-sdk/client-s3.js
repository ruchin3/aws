"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = exports.setListObjectsV2MockResolvedValue = exports.setGetObjectMockResolvedValue = void 0;
let getObjectMockResolvedValue;
const setGetObjectMockResolvedValue = (value) => {
    getObjectMockResolvedValue = value;
};
exports.setGetObjectMockResolvedValue = setGetObjectMockResolvedValue;
let listObjectsV2MockResolvedValue;
const setListObjectsV2MockResolvedValue = (value) => {
    listObjectsV2MockResolvedValue = value;
};
exports.setListObjectsV2MockResolvedValue = setListObjectsV2MockResolvedValue;
class S3 {
    getObject = jest.fn().mockImplementation(() => getObjectMockResolvedValue);
    listObjectsV2 = jest.fn().mockImplementation(() => listObjectsV2MockResolvedValue);
}
exports.S3 = S3;
//# sourceMappingURL=client-s3.js.map