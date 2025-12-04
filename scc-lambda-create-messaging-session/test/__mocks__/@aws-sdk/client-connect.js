"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connect = exports.getContactAttributesMock = exports.setGetContactAttributesMockResolvedValue = exports.setListInstanceStorageConfigsMockResolvedValue = void 0;
let listInstanceStorageConfigsMockResolvedValue;
const setListInstanceStorageConfigsMockResolvedValue = (value) => {
    listInstanceStorageConfigsMockResolvedValue = value;
};
exports.setListInstanceStorageConfigsMockResolvedValue = setListInstanceStorageConfigsMockResolvedValue;
let getContactAttributesMockResolvedValue = {
    $metadata: {},
    Attributes: {
        channelAddressIdentifier: '12345-1234-1234-12345',
        callCenterId: 'testCallCenter',
    },
};
const setGetContactAttributesMockResolvedValue = (value) => {
    getContactAttributesMockResolvedValue = value;
};
exports.setGetContactAttributesMockResolvedValue = setGetContactAttributesMockResolvedValue;
exports.getContactAttributesMock = jest.fn().mockImplementation(() => getContactAttributesMockResolvedValue);
class Connect {
    listInstanceStorageConfigs = jest.fn().mockImplementation(() => listInstanceStorageConfigsMockResolvedValue);
    getContactAttributes = exports.getContactAttributesMock;
}
exports.Connect = Connect;
//# sourceMappingURL=client-connect.js.map