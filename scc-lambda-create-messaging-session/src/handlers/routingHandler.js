"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingHandler = void 0;
const common_1 = require("../utils/common");
const constants_1 = require("../utils/constants");
const interactionService_1 = require("../interactionService");
const errors_1 = require("../errors");
function attachSalesforceFlowRoutingParameters(params, routingRequest) {
    routingRequest.routingInfo = {};
    routingRequest.routingInfo.flow = {
        flowId: params[constants_1.SALESFORCE_FLOW_ROUTING_FLOW_ID_KEY],
        queueId: params[constants_1.SALESFORCE_FLOW_ROUTING_FALLBACK_QUEUE_ID_KEY],
    };
    const routingAttributes = Object.keys(params)
        .filter((key) => key.startsWith(constants_1.SALESFORCE_FLOW_ROUTING_ATTRIBUTES_KEY_PREFIX))
        .reduce((attrs, key) => {
        attrs[key.split('.')[1]] = params[key];
        return attrs;
    }, {});
    if (Object.keys(routingAttributes).length != 0) {
        routingRequest.routingInfo.routingAttributes = routingAttributes;
    }
}
function attachSalesforceQueueRoutingParameters(params, routingRequest) {
    routingRequest.routingInfo = {};
    routingRequest.routingInfo.queueId = params[constants_1.SALESFORCE_QUEUE_ROUTING_QUEUE_ID_KEY];
}
function validateRoutingParameters(params) {
    if (!params.hasOwnProperty(constants_1.SALESFORCE_FLOW_ROUTING_TYPE_KEY)) {
        throw new errors_1.LambdaRequestValidationError('routingType is required.');
    }
    if (![constants_1.SALESFORCE_ROUTING_TYPE_INITIAL, constants_1.SALESFORCE_ROUTING_TYPE_TRANSFER].includes(params[constants_1.SALESFORCE_FLOW_ROUTING_TYPE_KEY])) {
        throw new errors_1.LambdaRequestValidationError('routingType can only be Initial or Transfer.');
    }
    const hasFlowId = params.hasOwnProperty(constants_1.SALESFORCE_FLOW_ROUTING_FLOW_ID_KEY);
    const hasFlowFallbackQueueId = params.hasOwnProperty(constants_1.SALESFORCE_FLOW_ROUTING_FALLBACK_QUEUE_ID_KEY);
    const hasQueueId = params.hasOwnProperty(constants_1.SALESFORCE_QUEUE_ROUTING_QUEUE_ID_KEY);
    if ((hasFlowId && !hasFlowFallbackQueueId) || (!hasFlowId && hasFlowFallbackQueueId)) {
        throw new errors_1.LambdaRequestValidationError('salesforceFlowFallbackQueueId and salesforceFlowId is required for flow based routing.');
    }
    if ((hasFlowId || hasFlowFallbackQueueId) && hasQueueId) {
        throw new errors_1.LambdaRequestValidationError('salesforceQueueId cannot be passed when salesforceFlowId or salesforceFlowFallbackQueueId are set.');
    }
    console.log('Routing parameters validated successfully');
}
function validateRoutingResponse(response) {
    if (!response.success) {
        throw new Error('Routing was unsuccessful.');
    }
}
const routingHandler = async function (event) {
    if (event.source === 'aws.events')
        return {};
    let routingRequest;
    const conversationIdentifier = (0, common_1.getContactAttributeValue)(event, 'conversationIdentifier');
    if (!conversationIdentifier) {
        throw new errors_1.LambdaRequestValidationError('Conversation Identifier is missing in contact attributes.');
    }
    const routingParameters = event.Details.Parameters;
    console.log(`Attempting to route work item for conversation identifier: ${conversationIdentifier}`);
    validateRoutingParameters(routingParameters);
    routingRequest = {
        conversationIdentifier: conversationIdentifier,
        routingType: routingParameters.routingType,
    };
    if (routingParameters.hasOwnProperty(constants_1.SALESFORCE_FLOW_ROUTING_FLOW_ID_KEY)) {
        attachSalesforceFlowRoutingParameters(routingParameters, routingRequest);
    }
    else if (routingParameters.hasOwnProperty(constants_1.SALESFORCE_QUEUE_ROUTING_QUEUE_ID_KEY)) {
        attachSalesforceQueueRoutingParameters(routingParameters, routingRequest);
    }
    console.log(`Route work item request data: ${JSON.stringify(routingRequest)}`);
    const response = await (0, interactionService_1.routeWorkItem)(routingRequest);
    const data = response.data;
    validateRoutingResponse(data);
    console.log(`Successfully routed work item with psrId ${data.psrId}`);
    let externalQueueId = null;
    if (data.contextParamMap && data.contextParamMap.hasOwnProperty(constants_1.SALESFORCE_EXTERNAL_QUEUE_ID)) {
        externalQueueId = data.contextParamMap[constants_1.SALESFORCE_EXTERNAL_QUEUE_ID];
    }
    return {
        psrId: data.psrId,
        externalQueueId: externalQueueId,
    };
};
exports.routingHandler = routingHandler;
//# sourceMappingURL=routingHandler.js.map