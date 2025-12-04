"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const auth_1 = require("../../src/utils/auth");
const interactionService_1 = require("../../src/interactionService");
const routing_contact_flow_event_json_1 = __importDefault(require("../fixtures/routing-contact-flow-event.json"));
jest.mock('axios');
jest.mock('../../src/utils/auth');
jest.mock('../../src/interactionService');
describe('routingHandler', () => {
    const lambdaEvent = routing_contact_flow_event_json_1.default;
    const accessToken = 'test-access-token';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it.each([
        [
            'default routing',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
            },
            {
                conversationIdentifier: 'test-conversation-identifier',
                routingType: 'Initial',
            },
        ],
        [
            'queue routing',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceQueueId: 'test-queue-id',
            },
            {
                conversationIdentifier: 'test-conversation-identifier',
                routingType: 'Initial',
                routingInfo: {
                    queueId: 'test-queue-id',
                },
            },
        ],
        [
            'flow routing',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceFlowId: 'test-flow-id',
                salesforceFlowFallbackQueueId: 'test-queue-id',
                'salesforceFlowRoutingAttributes.keyOne': 'value-one',
                'salesforceFlowRoutingAttributes.keyTwo': 'value-two',
            },
            {
                conversationIdentifier: 'test-conversation-identifier',
                routingType: 'Initial',
                routingInfo: {
                    flow: {
                        flowId: 'test-flow-id',
                        queueId: 'test-queue-id',
                    },
                    routingAttributes: {
                        keyOne: 'value-one',
                        keyTwo: 'value-two',
                    },
                },
            },
        ],
    ])('Routes work item successfully for %s', async (_, attributes, params, expectedRequest) => {
        lambdaEvent.Details.ContactData.Attributes = attributes;
        lambdaEvent.Details.Parameters = params;
        // @ts-ignore
        const mockResponse = {
            data: { success: true, psrId: 'test-psr-id' },
            status: 200,
            statusText: 'OK',
            headers: {},
        };
        auth_1.fetchAccessToken.mockResolvedValue(accessToken);
        interactionService_1.routeWorkItem.mockResolvedValue(mockResponse);
        // @ts-ignore
        const response = await (0, src_1.routingHandler)(lambdaEvent);
        expect(response.psrId).toBe('test-psr-id');
        expect(interactionService_1.routeWorkItem).toHaveBeenCalledWith(expectedRequest);
    });
    it.each([
        [
            'missing conversationIdentifier',
            {},
            {
                routingType: 'Initial',
            },
            'Conversation Identifier is missing in contact attributes.',
        ],
        [
            'missing routingType',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {},
            'routingType is required.',
        ],
        [
            'invalid routingType',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Invalid',
            },
            'routingType can only be Initial or Transfer.',
        ],
        [
            'missing salesforceFlowId for flow routing',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceFlowFallbackQueueId: 'test-queue-id',
            },
            'salesforceFlowFallbackQueueId and salesforceFlowId is required for flow based routing.',
        ],
        [
            'missing salesforceFlowFallbackQueueId for flow routing',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceFlowId: 'test-flow-id',
            },
            'salesforceFlowFallbackQueueId and salesforceFlowId is required for flow based routing.',
        ],
        [
            'salesforceQueueId cannot be passed along with salesforceFlowId',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceFlowId: 'test-flow-id',
                salesforceQueueId: 'test-queue-id',
            },
            'salesforceFlowFallbackQueueId and salesforceFlowId is required for flow based routing.',
        ],
        [
            'salesforceQueueId cannot be passed along with salesforceFlowFallbackQueueId',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceFlowFallbackQueueId: 'test-queue-id',
                salesforceQueueId: 'test-queue-id',
            },
            'salesforceFlowFallbackQueueId and salesforceFlowId is required for flow based routing.',
        ],
        [
            'salesforceQueueId cannot be passed along with salesforceFlowFallbackQueueId',
            {
                conversationIdentifier: 'test-conversation-identifier',
            },
            {
                routingType: 'Initial',
                salesforceFlowId: 'test-flow-id',
                salesforceFlowFallbackQueueId: 'test-queue-id',
                salesforceQueueId: 'test-queue-id',
            },
            'salesforceQueueId cannot be passed when salesforceFlowId or salesforceFlowFallbackQueueId are set.',
        ],
    ])('Validates %s', async (_, attributes, params, message) => {
        lambdaEvent.Details.ContactData.Attributes = attributes;
        lambdaEvent.Details.Parameters = params;
        try {
            await (0, src_1.routingHandler)(lambdaEvent);
        }
        catch (error) {
            expect(error.message).toBe(message);
        }
    });
    it('Terminates execution on warming invocations', async () => {
        lambdaEvent.source = 'aws.events';
        const response = await (0, src_1.routingHandler)(lambdaEvent);
        expect(response).toEqual({});
    });
});
//# sourceMappingURL=routingHandler.test.js.map