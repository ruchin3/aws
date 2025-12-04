"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = exports.MockConnection = void 0;
const mockAuthorize = jest.fn();
const mockMetadataRead = jest.fn();
const mockMetadataUpdate = jest.fn();
const mockMetadataCreate = jest.fn();
class MockConnection {
    authorize = mockAuthorize;
    metadata = {
        read: mockMetadataRead,
        update: mockMetadataUpdate,
        create: mockMetadataCreate,
    };
}
exports.MockConnection = MockConnection;
exports.Connection = MockConnection;
//# sourceMappingURL=connection.js.map