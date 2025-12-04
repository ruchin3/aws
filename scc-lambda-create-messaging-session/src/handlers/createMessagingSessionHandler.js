"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessagingSessionHandler = void 0;
const interactionService_1 = require("../interactionService");
const errors_1 = require("../errors");
const common_1 = require("../utils/common");
const createMessagingSessionHandler = async function (event) {
    if (event.source === 'aws.events')
        return {};
    if (!event.Details.ContactData.ContactId) {
        throw new errors_1.LambdaRequestValidationError('ContactId is missing from ContactData.');
    }
    const clientId = event.Details.ContactData.Attributes.clientId || event.Details.ContactData.InitialContactId;
    const channelAddressIdentifier = (0, common_1.getContactAttributeValue)(event, 'channelAddressIdentifier');
    if (!channelAddressIdentifier) {
        throw new errors_1.LambdaRequestValidationError('channelAddressIdentifier is missing from contact attributes.');
    }
    const response = await (0, interactionService_1.createMessagingSession)(clientId, channelAddressIdentifier);
    const callCenterId = process.env.CALL_CENTER_ID;
    return {
        workItemId: response['workItemIds'][0],
        conversationIdentifier: response['conversationIdentifier'],
        source: 'SCCAC',
        callCenterId: callCenterId,
    };
};
exports.createMessagingSessionHandler = createMessagingSessionHandler;
//# sourceMappingURL=createMessagingSessionHandler.js.map