"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactTraceRecordHandler = exports.getFieldString = void 0;
const common_1 = require("../utils/common");
const auth_1 = require("../utils/auth");
const CONTACT_TRACE_OBJECT_NAME = 'SCC_ContactTraceRecord__c';
const CONTACT_ID_INDEX_FIELD = 'ContactId__c';
const createCtrCustomObject = (ctrRecord) => {
    return {
        [(0, common_1.getSalesforceApiName)('Channel__c')]: 'DEPRECATED', //This field is deprecated. Please use "Channel Revamped" field as replacement.
        [(0, common_1.getSalesforceApiName)('Channel_Revamped__c')]: (0, common_1.safeGet)(ctrRecord, 'Channel'),
        [(0, common_1.getSalesforceApiName)('DisconnectReason__c')]: 'DEPRECATED', //This field is deprecated. Please use "DisconnectReason Revamped" field as replacement.
        [(0, common_1.getSalesforceApiName)('DisconnectReason_Revamped__c')]: (0, common_1.safeGet)(ctrRecord, 'DisconnectReason'),
        [(0, common_1.getSalesforceApiName)('Initiation_Method__c')]: 'DEPRECATED', //This field is deprecated. Please use "Initiation Method Revamped" field as replacement.
        [(0, common_1.getSalesforceApiName)('Initiation_Method_Revamped__c')]: (0, common_1.safeGet)(ctrRecord, 'InitiationMethod'),
        [(0, common_1.getSalesforceApiName)('AWSAccountId__c')]: (0, common_1.safeGet)(ctrRecord, 'AWSAccountId'),
        [(0, common_1.getSalesforceApiName)('AfterContactWorkDuration__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.AfterContactWorkDuration'),
        [(0, common_1.getSalesforceApiName)('AfterContactWorkEndTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.AfterContactWorkEndTimestamp'),
        [(0, common_1.getSalesforceApiName)('AfterContactWorkStartTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.AfterContactWorkStartTimestamp'),
        [(0, common_1.getSalesforceApiName)('AgentARN__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.ARN'),
        [(0, common_1.getSalesforceApiName)('AgentConnectedToAgentTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.ConnectedToAgentTimestamp'),
        [(0, common_1.getSalesforceApiName)('AgentConnectionAttempts__c')]: (0, common_1.safeGet)(ctrRecord, 'AgentConnectionAttempts'),
        [(0, common_1.getSalesforceApiName)('AgentHierarchyGroup__c')]: getFieldString(ctrRecord, 'Agent.HierarchyGroups'),
        [(0, common_1.getSalesforceApiName)('AgentInteractionDuration__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.AgentInteractionDuration'),
        [(0, common_1.getSalesforceApiName)('AgentRoutingProfileARN__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.RoutingProfile.ARN'),
        [(0, common_1.getSalesforceApiName)('AgentRoutingProfileName__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.RoutingProfile.Name'),
        [(0, common_1.getSalesforceApiName)('AgentUsername__c')]: (0, common_1.safeGet)(ctrRecord, 'Agent.Username'),
        [(0, common_1.getSalesforceApiName)('Attributes__c')]: getFieldString(ctrRecord, 'Attributes'),
        [(0, common_1.getSalesforceApiName)('ConnectedToSystemTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'ConnectedToSystemTimestamp'),
        [(0, common_1.getSalesforceApiName)('ContactId__c')]: (0, common_1.safeGet)(ctrRecord, 'ContactId'),
        [(0, common_1.getSalesforceApiName)('DisconnectTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'DisconnectTimestamp'),
        [(0, common_1.getSalesforceApiName)('InitialContactId__c')]: (0, common_1.safeGet)(ctrRecord, 'InitialContactId'),
        [(0, common_1.getSalesforceApiName)('InitiationTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'InitiationTimestamp'),
        [(0, common_1.getSalesforceApiName)('InstanceARN__c')]: (0, common_1.safeGet)(ctrRecord, 'InstanceARN'),
        [(0, common_1.getSalesforceApiName)('LastUpdateTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'LastUpdateTimestamp'),
        [(0, common_1.getSalesforceApiName)('NextContactId__c')]: (0, common_1.safeGet)(ctrRecord, 'NextContactId'),
        [(0, common_1.getSalesforceApiName)('PreviousContactId__c')]: (0, common_1.safeGet)(ctrRecord, 'PreviousContactId'),
        [(0, common_1.getSalesforceApiName)('QueueARN__c')]: (0, common_1.safeGet)(ctrRecord, 'Queue.ARN'),
        [(0, common_1.getSalesforceApiName)('QueueDequeueTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'Queue.DequeueTimestamp'),
        [(0, common_1.getSalesforceApiName)('QueueDuration__c')]: (0, common_1.safeGet)(ctrRecord, 'Queue.Duration'),
        [(0, common_1.getSalesforceApiName)('QueueEnqueueTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'Queue.EnqueueTimestamp'),
        [(0, common_1.getSalesforceApiName)('QueueName__c')]: (0, common_1.safeGet)(ctrRecord, 'Queue.Name'),
        [(0, common_1.getSalesforceApiName)('References__c')]: getFieldString(ctrRecord, 'References'),
        [(0, common_1.getSalesforceApiName)('SegmentAttributes__c')]: getFieldString(ctrRecord, 'SegmentAttributes'),
        [(0, common_1.getSalesforceApiName)('TransferCompletedTimestamp__c')]: (0, common_1.safeGet)(ctrRecord, 'TransferCompletedTimestamp'),
    };
};
function getFieldString(ctrRecord, field) {
    return (0, common_1.safeGet)(ctrRecord, field) ? JSON.stringify((0, common_1.safeGet)(ctrRecord, field)) : null;
}
exports.getFieldString = getFieldString;
const contactTraceRecordHandler = async (event) => {
    console.log('Received event in contactTraceRecordHandler.');
    const { message } = event;
    let ctrRecord;
    if (event.Records && event.Records[0].eventSource === 'aws:sqs') {
        console.log('Received event from SQS.');
        let sqsEventPayload = JSON.parse(event.Records[0].body);
        ctrRecord = sqsEventPayload.requestPayload.message;
        console.log('Successfully parsed ctrRecord from event coming from SQS.');
    }
    else {
        console.log('Received event from ctrKinesisRecordSegregationHandler.');
        ctrRecord = message;
    }
    if (!ctrRecord) {
        throw new Error('No CTR found in request : ' + JSON.stringify(event, null, 2));
    }
    const conn = await (0, auth_1.generateSFConnection)();
    const ctrCustomObject = createCtrCustomObject(ctrRecord);
    const ret = await conn.sobject((0, common_1.getSalesforceApiName)(CONTACT_TRACE_OBJECT_NAME)).upsert(ctrCustomObject, (0, common_1.getSalesforceApiName)(CONTACT_ID_INDEX_FIELD));
    if (ret.success) {
        console.log('CTR Created/Updated in Salesforce Successfully : ContactId :' + (0, common_1.safeGet)(ctrRecord, 'ContactId'));
    }
};
exports.contactTraceRecordHandler = contactTraceRecordHandler;
//# sourceMappingURL=contactTraceRecordHandler.js.map