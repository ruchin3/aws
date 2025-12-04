"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctrKinesisRecordSegregationHandler = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
const client_kinesis_1 = require("@aws-sdk/client-kinesis");
const lambda = new client_lambda_1.Lambda({});
const kinesis = new client_kinesis_1.Kinesis({});
const ctrKinesisRecordSegregationHandler = async (event) => {
    console.log('Received event.');
    let parsedPayload = {};
    if (!event.Records) {
        console.log('No reocrd present in received event.');
        return;
    }
    if (event.Records[0].eventSource === 'aws:sqs') {
        console.log('Received event from SQS.');
        // @ts-ignore
        let kinesisEventMetaData = JSON.parse(event.Records[0].body);
        const { streamArn, shardId, startSequenceNumber } = kinesisEventMetaData.KinesisBatchInfo;
        const streamName = streamArn.split('/').pop();
        const { ShardIterator } = await kinesis.getShardIterator({
            ShardIteratorType: 'AT_SEQUENCE_NUMBER',
            StreamName: streamName,
            ShardId: shardId,
            StartingSequenceNumber: startSequenceNumber,
        });
        const { Records } = await kinesis.getRecords({ ShardIterator });
        parsedPayload = JSON.parse(Buffer.from(Records?.[0]?.Data).toString('utf-8'));
        console.log('Successfully decoded payload from event coming from SQS.');
    }
    else {
        console.log('Received Kinesis Stream event:', JSON.stringify(event, null, 2));
        // @ts-ignore
        parsedPayload = JSON.parse(Buffer.from(event.Records[0].kinesis.data, 'base64').toString('utf-8'));
        console.log('Successfully decoded payload from event coming from kinesis.');
    }
    const callCenterId = process.env.CALL_CENTER_ID;
    // @ts-ignore
    if (parsedPayload.Attributes && parsedPayload.Attributes.source === 'SCCAC' && parsedPayload.Attributes.callCenterId === callCenterId) {
        const contactTraceRecordFunction = `SCCAC-ContactTraceRecordFunction-${callCenterId}`;
        await lambda.invoke({
            FunctionName: contactTraceRecordFunction,
            InvocationType: 'Event',
            Payload: JSON.stringify({ message: parsedPayload }),
        });
        // @ts-ignore
        console.log(`Successfully invoked lambda : ${contactTraceRecordFunction} : for CTR with contactId: `, parsedPayload.ContactId);
    }
};
exports.ctrKinesisRecordSegregationHandler = ctrKinesisRecordSegregationHandler;
//# sourceMappingURL=ctrKinesisRecordSegregationHandler.js.map