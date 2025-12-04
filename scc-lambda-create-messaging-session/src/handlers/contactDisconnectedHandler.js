"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactDisconnectedHandler = void 0;
const amazon_connect_messaging_data_converter_1 = require("@amzn/amazon-connect-messaging-data-converter");
const async_utils_1 = require("@amzn/async-utils");
const client_connect_1 = require("@aws-sdk/client-connect");
const client_s3_1 = require("@aws-sdk/client-s3");
const util_arn_parser_1 = require("@aws-sdk/util-arn-parser");
const dates_1 = require("../utils/dates");
const sleep_1 = require("../utils/sleep");
const lambda_1 = require("../utils/lambda");
const interactionService_1 = require("../interactionService");
const constants_1 = require("../utils/constants");
const errors_1 = require("../errors");
const axios_1 = require("axios");
const TRANSCRIPT_RETRY_COUNT = 3;
const TRANSCRIPT_RETRY_DELAY = 10_000;
const CONCURRENT_INTERACTION_API_CALLS = 3;
const MAX_PARTICIPANT_ENTRIES_PER_BATCH = 3;
const MAX_CONVERSATION_ENTRIES_PER_BATCH = 5;
const connect = new client_connect_1.Connect();
const s3 = new client_s3_1.S3();
const createResponse = (0, lambda_1.createResponder)(__filename);
const validateContact = async function (contact) {
    if (!contact || !contact.instanceArn || !contact.contactId) {
        throw new errors_1.LambdaRequestValidationError('Event contains invalid or missing contact information');
    }
    if (!(0, util_arn_parser_1.validate)(contact.instanceArn)) {
        throw new errors_1.LambdaRequestValidationError('Event contains invalid instance ARN');
    }
    if (contact.agentInfo) {
        throw new errors_1.LambdaRequestValidationError('Event was not for a chatbot-only interaction');
    }
    const instanceArn = (0, util_arn_parser_1.parse)(contact.instanceArn);
    // The ARN's resource is in the format "instance/12345678-1234-1234-1234-123456789012"
    // so, split on "/" to just get the Connect instance ID.
    const instanceId = instanceArn.resource.split('/')[1];
    const contactId = contact.contactId;
    const actualCallCenterId = process.env.CALL_CENTER_ID;
    const initialContactId = contact.initialContactId ?? contactId;
    const contactAttributes = (await connect.getContactAttributes({
        InstanceId: instanceId,
        InitialContactId: initialContactId,
    }))?.Attributes ?? {};
    // Verify contact belongs to correct Salesforce Call Center
    if (contactAttributes.callCenterId == null || contactAttributes.callCenterId !== actualCallCenterId) {
        throw new errors_1.LambdaRequestValidationError('Event belongs to different Salesforce Call Center.');
    }
    if (!contactAttributes.channelAddressIdentifier) {
        throw new errors_1.LambdaRequestValidationError('channelAddressIdentifier is missing from contact attributes');
    }
    return contactAttributes;
};
const getTranscript = async function (instanceId, contactId, eventTime) {
    const s3Config = (await connect.listInstanceStorageConfigs({
        InstanceId: instanceId,
        ResourceType: 'CHAT_TRANSCRIPTS',
    })).StorageConfigs?.[0]?.S3Config;
    if (!s3Config) {
        throw new errors_1.ResourceNotFoundError('No storage config of type CHAT_TRANSCRIPTS found for Connect instance');
    }
    const { BucketName: bucketName, BucketPrefix: bucketPrefix } = s3Config;
    if (!bucketName || !bucketPrefix) {
        throw new errors_1.ResourceNotFoundError('No valid storage config of type CHAT_TRANSCRIPTS found for Connect instance; Missing BucketName and/or BucketPrefix');
    }
    const { year, month, day } = (0, dates_1.parseEventTime)(eventTime);
    const keyPrefix = [bucketPrefix, `${year}`, `${month}`.padStart(2, '0'), `${day}`.padStart(2, '0'), `${contactId}_`].join('/');
    let key;
    for (let i = 0; i < TRANSCRIPT_RETRY_COUNT; i++) {
        key = (await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: keyPrefix,
        })).Contents?.[0]?.Key;
        if (key) {
            break;
        }
        await (0, sleep_1.sleep)(TRANSCRIPT_RETRY_DELAY);
    }
    if (!key) {
        throw new errors_1.ResourceNotFoundError(`Unable to find chat transcript in S3 matching prefix: ${key}`);
    }
    const transcriptS3ObjectBody = (await s3.getObject({
        Bucket: bucketName,
        Key: key,
    })).Body;
    if (!transcriptS3ObjectBody) {
        throw new errors_1.InternalServiceError('Unable to get chat transcript in S3 matching key');
    }
    const transcriptString = await transcriptS3ObjectBody.transformToString();
    if (!transcriptString) {
        throw new errors_1.InternalServiceError('Unable to transform chat transcript object from S3 to string');
    }
    try {
        return JSON.parse(transcriptString);
    }
    catch (error) {
        throw new errors_1.InternalServiceError('Unable to parse chat transcript object JSON');
    }
};
const contactDisconnectedHandler = async function (event) {
    console.log('contactDisconnectedHandler invoked with ContactEvent', JSON.stringify(event, null, 2));
    let unconvertableMessageCount = 0;
    try {
        const contact = event.detail;
        const contactAttributes = await validateContact(contact);
        const instanceArn = (0, util_arn_parser_1.parse)(contact.instanceArn);
        // The ARN's resource is in the format "instance/12345678-1234-1234-1234-123456789012"
        // so, split on "/" to just get the Connect instance ID.
        const instanceId = instanceArn.resource.split('/')[1];
        const contactId = contact.contactId;
        const transcriptObject = await getTranscript(instanceId, contactId, event.time);
        const transcriptMessages = transcriptObject?.Transcript?.filter((transcriptMessage) => {
            return transcriptMessage && transcriptMessage.Type === 'MESSAGE';
        });
        if (!transcriptMessages || transcriptMessages.length === 0) {
            throw new errors_1.LambdaRequestValidationError('No transcript messages found in chat transcript object JSON');
        }
        const sfConvertedTranscriptMessages = transcriptMessages
            .map((transcriptMessage) => {
            let sfConvertedTranscriptMessage;
            try {
                sfConvertedTranscriptMessage = amazon_connect_messaging_data_converter_1.SalesforceMessagingDataConverter.convert(transcriptMessage);
                sfConvertedTranscriptMessage.originalTranscriptMessage = transcriptMessage;
            }
            catch (error) {
                console.error('An error occurred while converting transcript message', error);
                return undefined;
            }
            if (!sfConvertedTranscriptMessage) {
                console.error('Unable to convert transcript message');
                return undefined;
            }
            return sfConvertedTranscriptMessage;
        })
            .filter((transcriptMessage) => transcriptMessage !== undefined);
        if (sfConvertedTranscriptMessages.length === 0) {
            throw new errors_1.InternalServiceError('Unable to convert any transcript messages found in chat transcript object JSON');
        }
        unconvertableMessageCount = transcriptMessages.length - sfConvertedTranscriptMessages.length;
        const fromClientId = contactAttributes.clientId || contactId;
        const concurrentQueue = new async_utils_1.ConcurrentQueue(CONCURRENT_INTERACTION_API_CALLS);
        const conversationParticipants = new Map();
        const botParticipants = [constants_1.ParticipantRole.SYSTEM, constants_1.ParticipantRole.CUSTOM_BOT];
        const joinedTime = { joinedTime: sfConvertedTranscriptMessages[0].timestamp }; //note: we're already validating this is not empty above
        for (const sfConvertedTranscriptMessage of sfConvertedTranscriptMessages) {
            const originalTranscriptMessage = sfConvertedTranscriptMessage.originalTranscriptMessage;
            const isChatbot = botParticipants.includes(originalTranscriptMessage.ParticipantRole);
            const subject = isChatbot ? originalTranscriptMessage.ParticipantId : fromClientId;
            if (!conversationParticipants.has(subject)) {
                const leftTime = isChatbot ? { leftTime: Date.now() } : {};
                conversationParticipants.set(subject, {
                    displayName: originalTranscriptMessage.DisplayName,
                    participant: {
                        subject,
                        role: isChatbot ? 'Chatbot' : 'EndUser',
                        appType: 'custom',
                    },
                    ...joinedTime,
                    ...leftTime,
                });
            }
        }
        if (!conversationParticipants.has(fromClientId)) {
            conversationParticipants.set(fromClientId, {
                displayName: 'EndUser',
                participant: {
                    subject: fromClientId,
                    role: 'EndUser',
                    appType: 'custom',
                },
                ...joinedTime,
            });
        }
        // create or get message session
        const channelAddressIdentifier = contactAttributes.channelAddressIdentifier;
        await (0, interactionService_1.createMessagingSession)(fromClientId, channelAddressIdentifier);
        let pendingConversationEntries = [];
        let pendingParticipants = new Map();
        pendingParticipants.set(fromClientId, conversationParticipants.get(fromClientId));
        sfConvertedTranscriptMessages.forEach((sfConvertedTranscriptMessage) => {
            const originalTranscriptMessage = sfConvertedTranscriptMessage.originalTranscriptMessage;
            const subject = botParticipants.includes(originalTranscriptMessage.ParticipantRole) ? originalTranscriptMessage.ParticipantId : fromClientId;
            if ((!pendingParticipants.has(subject) && pendingParticipants.size == MAX_PARTICIPANT_ENTRIES_PER_BATCH) ||
                pendingConversationEntries.length == MAX_CONVERSATION_ENTRIES_PER_BATCH) {
                const conversationEntries = pendingConversationEntries;
                const currentParticipants = [...pendingParticipants.values()];
                concurrentQueue.enqueue(() => (0, interactionService_1.sendConversationHistory)(channelAddressIdentifier, currentParticipants, conversationEntries));
                pendingConversationEntries = [];
                pendingParticipants = new Map();
                pendingParticipants.set(fromClientId, conversationParticipants.get(fromClientId));
            }
            const currentParticipant = conversationParticipants.get(subject);
            const conversationEntry = {
                clientTimestamp: sfConvertedTranscriptMessage.timestamp,
                sender: currentParticipant.participant,
                entryPayload: sfConvertedTranscriptMessage.payload,
            };
            pendingConversationEntries.push(conversationEntry);
            if (!pendingParticipants.has(subject)) {
                pendingParticipants.set(subject, currentParticipant);
            }
        });
        if (pendingConversationEntries.length > 0) {
            const conversationEntries = pendingConversationEntries;
            concurrentQueue.enqueue(() => (0, interactionService_1.sendConversationHistory)(channelAddressIdentifier, [...pendingParticipants.values()], conversationEntries));
        }
        const results = await concurrentQueue.process();
        for (const result of results) {
            if (result.status === 'rejected') {
                throw result.reason;
            }
        }
    }
    catch (error) {
        let statusCode = 500;
        if (error instanceof errors_1.LambdaRequestValidationError) {
            statusCode = 400;
        }
        else if (error instanceof errors_1.ResourceNotFoundError) {
            statusCode = 404;
        }
        else if ((0, axios_1.isAxiosError)(error)) {
            statusCode = error?.response?.status ?? 500;
        }
        return createResponse(statusCode, {
            result: statusCode == 500 ? 'ERROR' : 'INVALID',
            message: `An error has occurred; ${JSON.stringify(error, ['message', 'stack'])}`,
        }, console.error);
    }
    if (unconvertableMessageCount > 0) {
        // The HyperText Transfer Protocol (HTTP) 202 Accepted response status code indicates that
        // the request has been accepted for processing, but the processing has not been completed;
        // in fact, processing may not have started yet. The request might or might not eventually
        // be acted upon, as it might be disallowed when processing actually takes place.
        //
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202
        return createResponse(202, {
            result: 'PARTIAL',
            unconvertableMessageCount,
        }, console.info);
    }
    return createResponse(200, {
        result: 'SUCCESS',
    }, console.info);
};
exports.contactDisconnectedHandler = contactDisconnectedHandler;
//# sourceMappingURL=contactDisconnectedHandler.js.map