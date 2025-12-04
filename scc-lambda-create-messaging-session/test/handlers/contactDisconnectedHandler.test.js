"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contactDisconnectedHandler_1 = require("../../src/handlers/contactDisconnectedHandler");
const client_connect_1 = require("../__mocks__/@aws-sdk/client-connect");
const client_s3_1 = require("../__mocks__/@aws-sdk/client-s3");
const invalid_transcript_json_1 = __importDefault(require("../fixtures/invalid-transcript.json"));
const valid_transcript_json_1 = __importDefault(require("../fixtures/valid-transcript.json"));
const bot_transcript_json_1 = __importDefault(require("../fixtures/bot-transcript.json"));
const customer_transcript_json_1 = __importDefault(require("../fixtures/customer-transcript.json"));
const valid_transcript_with_custom_bot_json_1 = __importDefault(require("../fixtures/valid-transcript-with-custom-bot.json"));
const valid_transcript_with_lex_and_custom_bot_json_1 = __importDefault(require("../fixtures/valid-transcript-with-lex-and-custom-bot.json"));
const valid_transcript_with_more_than_3_participants_json_1 = __importDefault(require("../fixtures/valid-transcript-with-more-than-3-participants.json"));
jest.mock('../../src/interactionService');
jest.mock('../../src/utils/sleep');
describe('contactDisconnectedHandler', () => {
    beforeEach(() => {
        process.env.CALL_CENTER_ID = 'testCallCenter';
    });
    test('Succeeds with HTTP 202 if chat transcript JSON is valid and SOME messages are converted correctly', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        const partiallyValidTranscriptFixtureObject = JSON.parse(JSON.stringify(valid_transcript_json_1.default));
        partiallyValidTranscriptFixtureObject?.Transcript?.push({
            ContentType: 'text/plain',
            Id: '00000000-0000-0000-0000-000000000000',
            Type: 'MESSAGE',
            ParticipantId: '11111111-3333-4444-5555-666666666666',
            DisplayName: 'SYSTEM_MESSAGE',
            // No "Content"
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(partiallyValidTranscriptFixtureObject)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(202);
        expect(JSON.parse(result.body)?.result).toEqual('PARTIAL');
        expect(JSON.parse(result.body)?.unconvertableMessageCount).toEqual(1);
    });
    test('Succeeds with HTTP 200 if chat transcript JSON is valid and ALL messages are converted correctly', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(valid_transcript_json_1.default)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Succeeds with HTTP 200 if chat transcript JSON is valid and ALL messages are converted correctly, when initialContactId is different from contactId', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(valid_transcript_json_1.default)),
            },
            $metadata: {},
        });
        const initialContactId = '12345678-1234-1234-1234-123456789012-initial';
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
                initialContactId: initialContactId,
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(client_connect_1.getContactAttributesMock).toHaveBeenCalledWith({
            InstanceId: '12345678-1234-1234-1234-123456789012',
            InitialContactId: initialContactId,
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Succeeds with HTTP 200 if chat transcript JSON is valid and ALL CUSTOM_BOT messages are converted correctly', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(valid_transcript_with_custom_bot_json_1.default)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Succeeds with HTTP 200 if chat transcript JSON is valid and ALL CUSTOM_BOT and SYSTEM messages are converted correctly', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(valid_transcript_with_lex_and_custom_bot_json_1.default)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Succeeds with HTTP 200 if chat transcript JSON is valid and ALL 4 participants messages are converted correctly', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(valid_transcript_with_more_than_3_participants_json_1.default)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Fails if an unknown error occurs', async () => {
        // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)();
        expect(result.statusCode).toEqual(500);
        expect(JSON.parse(result.body)?.result).toEqual('ERROR');
        expect(JSON.parse(result.body)?.message).toMatch('An error has occurred; ');
    });
    test('Fails if event contains invalid or missing contact information', async () => {
        // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('Event contains invalid or missing contact information');
        // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
        const result2 = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            time: '2024-07-08T15:04:08Z',
        });
        expect(result2.statusCode).toEqual(400);
        expect(JSON.parse(result2.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result2.body)?.message).toContain('Event contains invalid or missing contact information');
    });
    test('Fails if contact contains invalid instance ARN', async () => {
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'foobar',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('Event contains invalid instance ARN');
    });
    test('Fails if no CHAT_TRANSCRIPTS is found', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [],
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('No storage config of type CHAT_TRANSCRIPTS found for Connect instance');
    });
    test('Fails if CHAT_TRANSCRIPTS storage config is invalid', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: '', // Invalid
                        BucketPrefix: '', // Invalid
                    },
                },
            ],
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('No valid storage config of type CHAT_TRANSCRIPTS found for Connect instance; Missing BucketName and/or BucketPrefix');
    });
    test('Fails if chat transcript is not found in S3 matching prefix', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [],
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('Unable to find chat transcript in S3 matching prefix');
    }, 35_000);
    test('Fails if chat transcript is not found in S3 matching key', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(500);
        expect(JSON.parse(result.body)?.result).toEqual('ERROR');
        expect(JSON.parse(result.body)?.message).toContain('Unable to get chat transcript in S3 matching key');
    });
    test('Fails if chat transcript cannot be transformed to string', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(undefined),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(500);
        expect(JSON.parse(result.body)?.result).toEqual('ERROR');
        expect(JSON.parse(result.body)?.message).toContain('Unable to transform chat transcript object from S3 to string');
    });
    test('Fails if chat transcript JSON string cannot be parsed', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue('INVALID JSON'),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(500);
        expect(JSON.parse(result.body)?.result).toEqual('ERROR');
        expect(JSON.parse(result.body)?.message).toContain('Unable to parse chat transcript object JSON');
    });
    test('Fails if chat transcript JSON does not contain any messages', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue('{}'),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('No transcript messages found in chat transcript object JSON');
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue('{"Transcript":[]}'),
            },
            $metadata: {},
        });
        const result2 = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result2.statusCode).toEqual(400);
        expect(JSON.parse(result2.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result2.body)?.message).toContain('No transcript messages found in chat transcript object JSON');
    });
    test('Fails if chat transcript JSON contains no convertable messages', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(invalid_transcript_json_1.default)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(500);
        expect(JSON.parse(result.body)?.result).toEqual('ERROR');
        expect(JSON.parse(result.body)?.message).toContain('Unable to convert any transcript messages found in chat transcript object JSON');
    });
    test('Succeeds if no ChatBot participant messages', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        const customerValidTranscriptFixtureObject = JSON.parse(JSON.stringify(customer_transcript_json_1.default));
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(customerValidTranscriptFixtureObject)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Succeeds if no customer participant messages', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        const botValidTranscriptFixtureObject = JSON.parse(JSON.stringify(bot_transcript_json_1.default));
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(botValidTranscriptFixtureObject)),
            },
            $metadata: {},
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)?.result).toEqual('SUCCESS');
    });
    test('Fails if channel address identifier is not set in contact attributes', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        const partiallyValidTranscriptFixtureObject = JSON.parse(JSON.stringify(valid_transcript_json_1.default));
        partiallyValidTranscriptFixtureObject?.Transcript?.push({
            ContentType: 'text/plain',
            Id: '00000000-0000-0000-0000-000000000000',
            Type: 'MESSAGE',
            ParticipantId: '11111111-3333-4444-5555-666666666666',
            DisplayName: 'SYSTEM_MESSAGE',
            // No "Content"
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(partiallyValidTranscriptFixtureObject)),
            },
            $metadata: {},
        });
        (0, client_connect_1.setGetContactAttributesMockResolvedValue)({
            $metadata: {},
            Attributes: { callCenterId: 'testCallCenter' },
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('channelAddressIdentifier is missing from contact attributes');
    });
    test('Fails if Event belongs to different Salesforce Call Center', async () => {
        (0, client_connect_1.setListInstanceStorageConfigsMockResolvedValue)({
            StorageConfigs: [
                {
                    StorageType: 'S3',
                    S3Config: {
                        BucketName: 'bucket-name',
                        BucketPrefix: 'bucket-prefix',
                    },
                },
            ],
            $metadata: {},
        });
        (0, client_s3_1.setListObjectsV2MockResolvedValue)({
            Contents: [
                {
                    Key: 'bucket-prefix/2024/07/08/12345678-1234-1234-1234-123456789012_20240708T15:04_UTC.json',
                },
            ],
            $metadata: {},
        });
        const partiallyValidTranscriptFixtureObject = JSON.parse(JSON.stringify(valid_transcript_json_1.default));
        partiallyValidTranscriptFixtureObject?.Transcript?.push({
            ContentType: 'text/plain',
            Id: '00000000-0000-0000-0000-000000000000',
            Type: 'MESSAGE',
            ParticipantId: '11111111-3333-4444-5555-666666666666',
            DisplayName: 'SYSTEM_MESSAGE',
            // No "Content"
        });
        (0, client_s3_1.setGetObjectMockResolvedValue)({
            // @ts-ignore - Jest mock function signature doesn't match defined type
            Body: {
                transformToString: jest.fn().mockResolvedValue(JSON.stringify(partiallyValidTranscriptFixtureObject)),
            },
            $metadata: {},
        });
        (0, client_connect_1.setGetContactAttributesMockResolvedValue)({
            $metadata: {},
            Attributes: { callCenterId: 'differentTestCallCenter' },
        });
        const result = await (0, contactDisconnectedHandler_1.contactDisconnectedHandler)({
            detail: {
                // @ts-ignore - contactDisconnectedHandler expects a proper ContactEvent
                instanceArn: 'arn:aws::connect:your-region:123456789012:instance/12345678-1234-1234-1234-123456789012',
                contactId: '12345678-1234-1234-1234-123456789012',
            },
            time: '2024-07-08T15:04:08Z',
        });
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)?.result).toEqual('INVALID');
        expect(JSON.parse(result.body)?.message).toContain('Event belongs to different Salesforce Call Center.');
    });
});
//# sourceMappingURL=contactDisconnectedHandler.test.js.map