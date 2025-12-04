"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../src/utils/auth");
const src_1 = require("../../src");
jest.mock('@jsforce/jsforce-node');
jest.mock('../../src/utils/auth');
describe('contactTraceRecordHandler', () => {
    const mockUpsert = jest.fn();
    let mockConnection;
    let mockSObject;
    beforeEach(() => {
        jest.clearAllMocks();
        mockSObject = { upsert: mockUpsert };
        mockConnection = { sobject: jest.fn().mockReturnValue(mockSObject) };
        auth_1.generateSFConnection.mockResolvedValue(mockConnection);
        console.error = jest.fn();
    });
    // Test: Should process valid CTR event and upsert into Salesforce
    it('should process valid CTR event and upsert into Salesforce', async () => {
        const event = {
            message: {
                AWSAccountId: '225989341185',
                Channel: 'CHAT',
                ContactId: '83c3c211-3dd9-43de-bd46-59d8abb67531',
                DisconnectReason: 'AGENT_DISCONNECT',
                InitiationMethod: 'API',
                AWSContactTraceRecordFormatVersion: '2017-03-10',
                InitiationTimestamp: '2025-01-14T00:14:41Z',
                DisconnectTimestamp: '2025-01-14T00:15:17Z',
                Agent: { ARN: 'test' },
            },
        };
        mockUpsert.mockResolvedValue({ success: true });
        await (0, src_1.contactTraceRecordHandler)(event);
        expect(mockSObject.upsert).toHaveBeenCalledWith(expect.objectContaining({
            awsac__Channel__c: 'DEPRECATED',
            awsac__Channel_Revamped__c: 'CHAT',
            awsac__ContactId__c: '83c3c211-3dd9-43de-bd46-59d8abb67531',
            awsac__DisconnectReason__c: 'DEPRECATED',
            awsac__DisconnectReason_Revamped__c: 'AGENT_DISCONNECT',
        }), 'awsac__ContactId__c');
        expect(mockSObject.upsert).toHaveBeenCalledTimes(1);
    });
    // Test: Should handle invalid event (No CTR in message)
    it('should handle invalid event (No CTR in message)', async () => {
        const event = { message: '' };
        await expect((0, src_1.contactTraceRecordHandler)(event)).rejects.toThrow('No CTR found in request');
        expect(console.error).not.toHaveBeenCalled();
    });
    // Test: Should handle failed upsert (Salesforce API error)
    it('should handle failed upsert (Salesforce API error)', async () => {
        const event = {
            message: {
                AWSAccountId: '225989341185',
                Channel: 'CHAT',
                ContactId: '83c3c211-3dd9-43de-bd46-59d8abb67531',
                DisconnectReason: 'AGENT_DISCONNECT',
            },
        };
        mockUpsert.mockRejectedValue(new Error('Salesforce API error'));
        await expect((0, src_1.contactTraceRecordHandler)(event)).rejects.toThrow('Salesforce API error');
    });
    // Test: Should handle missing fields in CTR record gracefully
    it('should handle missing fields in CTR record gracefully', async () => {
        const event = {
            message: {
                AWSAccountId: '225989341185',
                Channel: 'CHAT',
                ContactId: '83c3c211-3dd9-43de-bd46-59d8abb67531',
                InitiationMethod: 'API',
            },
        };
        mockUpsert.mockResolvedValue({ success: true });
        await (0, src_1.contactTraceRecordHandler)(event);
        expect(mockSObject.upsert).toHaveBeenCalledWith(expect.objectContaining({
            awsac__Channel__c: 'DEPRECATED',
            awsac__Channel_Revamped__c: 'CHAT',
            awsac__ContactId__c: '83c3c211-3dd9-43de-bd46-59d8abb67531',
            awsac__DisconnectReason__c: 'DEPRECATED',
            awsac__DisconnectReason_Revamped__c: null,
        }), 'awsac__ContactId__c');
        expect(mockSObject.upsert).toHaveBeenCalledTimes(1);
    });
    // Test: Should handle SQS event correctly
    it('should handle an SQS event and extract CTR correctly', async () => {
        const event = {
            Records: [
                {
                    eventSource: 'aws:sqs',
                    body: JSON.stringify({
                        requestPayload: {
                            message: {
                                AWSAccountId: '225989341185',
                                Channel: 'VOICE',
                                ContactId: 'test-contact-id',
                            },
                        },
                    }),
                },
            ],
        };
        mockUpsert.mockResolvedValue({ success: true });
        await (0, src_1.contactTraceRecordHandler)(event);
        expect(mockSObject.upsert).toHaveBeenCalledWith(expect.objectContaining({
            awsac__Channel__c: 'DEPRECATED',
            awsac__Channel_Revamped__c: 'VOICE',
            awsac__ContactId__c: 'test-contact-id',
        }), 'awsac__ContactId__c');
        expect(mockSObject.upsert).toHaveBeenCalledTimes(1);
    });
    // Test: Should handle Kinesis event correctly
    it('should handle an event from ctrKinesisRecordSegregationHandler correctly', async () => {
        const event = {
            message: {
                AWSAccountId: '225989341185',
                Channel: 'VIDEO',
                ContactId: 'kinesis-contact-id',
            },
        };
        mockUpsert.mockResolvedValue({ success: true });
        await (0, src_1.contactTraceRecordHandler)(event);
        expect(mockSObject.upsert).toHaveBeenCalledWith(expect.objectContaining({
            awsac__Channel__c: 'DEPRECATED',
            awsac__Channel_Revamped__c: 'VIDEO',
            awsac__ContactId__c: 'kinesis-contact-id',
        }), 'awsac__ContactId__c');
        expect(mockSObject.upsert).toHaveBeenCalledTimes(1);
    });
    // Test: Should correctly handle JSON conversion for Attributes field
    it('should handle JSON conversion for Attributes field correctly', async () => {
        const event = {
            message: {
                AWSAccountId: '225989341185',
                Channel: 'CHAT',
                ContactId: 'json-test-id',
                Attributes: { key1: 'value1', key2: 'value2' },
            },
        };
        mockUpsert.mockResolvedValue({ success: true });
        await (0, src_1.contactTraceRecordHandler)(event);
        expect(mockSObject.upsert).toHaveBeenCalledWith(expect.objectContaining({
            awsac__Attributes__c: JSON.stringify({ key1: 'value1', key2: 'value2' }),
        }), 'awsac__ContactId__c');
    });
    // Test: Should handle null attributes properly
    it('should handle null attributes properly', async () => {
        const event = {
            message: {
                AWSAccountId: '225989341185',
                Channel: 'CHAT',
                ContactId: 'empty-attributes-id',
                Attributes: null, // Attributes explicitly set to null
            },
        };
        mockUpsert.mockResolvedValue({ success: true });
        await (0, src_1.contactTraceRecordHandler)(event);
        expect(mockSObject.upsert).toHaveBeenCalledWith(expect.objectContaining({
            awsac__Channel__c: 'DEPRECATED',
            awsac__Channel_Revamped__c: 'CHAT',
            awsac__ContactId__c: 'empty-attributes-id',
            awsac__Attributes__c: null,
        }), 'awsac__ContactId__c');
        expect(mockSObject.upsert).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=contactTraceRecordHandler.test.js.map