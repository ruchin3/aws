"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ctrKinesisRecordSegregationHandler_1 = require("../../src/handlers/ctrKinesisRecordSegregationHandler");
const client_lambda_1 = require("../__mocks__/@aws-sdk/client-lambda");
const client_kinesis_1 = require("../__mocks__/@aws-sdk/client-kinesis");
describe('ctrKinesisRecordSegregationHandler', () => {
    const callCenterId = '12345';
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.CALL_CENTER_ID = callCenterId;
        client_lambda_1.invokeMock.mockResolvedValue({ StatusCode: 200 });
        client_kinesis_1.getShardIteratorMock.mockResolvedValue({ ShardIterator: 'mock-shard-iterator' });
        client_kinesis_1.getRecordsMock.mockResolvedValue({
            Records: [
                {
                    Data: Buffer.from(JSON.stringify({
                        Attributes: { source: 'SCCAC', callCenterId },
                        ContactId: 'test-contact-id',
                    })),
                },
            ],
        });
    });
    it('should process a valid Kinesis event and invoke the corresponding Lambda', async () => {
        const event = {
            Records: [
                {
                    kinesis: {
                        data: Buffer.from(JSON.stringify({ Attributes: { source: 'SCCAC', callCenterId: callCenterId } })).toString('base64'),
                        kinesisSchemaVersion: '1.0',
                        partitionKey: 'partition-key',
                        sequenceNumber: 'sequence-number',
                        approximateArrivalTimestamp: Date.now() / 1000,
                    },
                    eventSource: 'aws:kinesis',
                    eventVersion: '1.0',
                    eventID: 'event-id',
                    eventName: 'aws:kinesis:record',
                    awsRegion: 'us-east-1',
                    eventSourceARN: 'arn:aws:kinesis:us-east-1:123456789012:stream/test-stream',
                    invokeIdentityArn: '',
                },
            ],
        };
        await (0, ctrKinesisRecordSegregationHandler_1.ctrKinesisRecordSegregationHandler)(event);
        expect(client_lambda_1.invokeMock).toHaveBeenCalledTimes(1);
        expect(client_lambda_1.invokeMock).toHaveBeenCalledWith({
            FunctionName: `SCCAC-ContactTraceRecordFunction-${callCenterId}`,
            InvocationType: 'Event',
            Payload: JSON.stringify({ message: { Attributes: { source: 'SCCAC', callCenterId: callCenterId } } }),
        });
    });
    it('should skip the record if source is not SCCAC', async () => {
        const event = {
            Records: [
                {
                    kinesis: {
                        data: Buffer.from(JSON.stringify({ Attributes: { source: 'OtherSource' } })).toString('base64'),
                        approximateArrivalTimestamp: 0,
                        kinesisSchemaVersion: '',
                        partitionKey: '',
                        sequenceNumber: '',
                    },
                    eventSource: 'aws:kinesis',
                    awsRegion: '',
                    eventID: '',
                    eventName: '',
                    eventSourceARN: '',
                    eventVersion: '',
                    invokeIdentityArn: '',
                },
            ],
        };
        await (0, ctrKinesisRecordSegregationHandler_1.ctrKinesisRecordSegregationHandler)(event);
        expect(client_lambda_1.invokeMock).not.toHaveBeenCalled();
    });
    it('should handle invalid JSON payload gracefully', async () => {
        const event = {
            Records: [
                {
                    kinesis: {
                        data: Buffer.from('invalid-json-data').toString('base64'),
                        approximateArrivalTimestamp: 0,
                        kinesisSchemaVersion: '',
                        partitionKey: '',
                        sequenceNumber: '',
                    },
                    eventSource: 'aws:kinesis',
                    awsRegion: '',
                    eventID: '',
                    eventName: '',
                    eventSourceARN: '',
                    eventVersion: '',
                    invokeIdentityArn: '',
                },
            ],
        };
        await expect((0, ctrKinesisRecordSegregationHandler_1.ctrKinesisRecordSegregationHandler)(event)).rejects.toThrow();
        expect(client_lambda_1.invokeMock).not.toHaveBeenCalled();
    });
    it('should process an SQS event and retrieve data from Kinesis', async () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        KinesisBatchInfo: {
                            streamArn: 'arn:aws:kinesis:us-east-1:123456789012:stream/test-stream',
                            shardId: 'shard-000',
                            startSequenceNumber: 'sequence-number',
                        },
                    }),
                    eventSource: 'aws:sqs',
                    messageId: '',
                    receiptHandle: '',
                    md5OfBody: '',
                    eventSourceARN: '',
                    awsRegion: '',
                    attributes: {
                        ApproximateReceiveCount: '',
                        SentTimestamp: '',
                        SenderId: '',
                        ApproximateFirstReceiveTimestamp: '',
                    },
                    messageAttributes: {},
                },
            ],
        };
        await (0, ctrKinesisRecordSegregationHandler_1.ctrKinesisRecordSegregationHandler)(event);
        expect(client_kinesis_1.getShardIteratorMock).toHaveBeenCalled();
        expect(client_kinesis_1.getRecordsMock).toHaveBeenCalled();
        expect(client_lambda_1.invokeMock).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=ctrKinesisRecordSegregationHandler.test.js.map