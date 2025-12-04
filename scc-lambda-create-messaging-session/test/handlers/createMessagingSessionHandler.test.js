"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const auth_1 = require("../../src/utils/auth");
const interactionService_1 = require("../../src/interactionService");
const create_messaging_session_contact_flow_event_json_1 = __importDefault(require("../fixtures/create-messaging-session-contact-flow-event.json"));
jest.mock('axios');
jest.mock('../../src/utils/auth');
jest.mock('../../src/interactionService');
describe('createMessagingSessionHandler', () => {
    const lambdaEvent = create_messaging_session_contact_flow_event_json_1.default;
    const accessToken = 'test-access-token';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('Routes work item successfully', async () => {
        lambdaEvent.Details.ContactData.ContactId = 'contact-id';
        lambdaEvent.Details.ContactData.InitialContactId = 'contact-id';
        // @ts-ignore
        const mockResponse = {
            workItemIds: ['test-workItem-id'],
            conversationIdentifier: 'test-conversation-id',
        };
        auth_1.fetchAccessToken.mockResolvedValue(accessToken);
        interactionService_1.createMessagingSession.mockResolvedValue(mockResponse);
        // @ts-ignore
        const response = await (0, src_1.createMessagingSessionHandler)(lambdaEvent);
        expect(response.workItemId).toBe('test-workItem-id');
        expect(response.conversationIdentifier).toBe('test-conversation-id');
        expect(interactionService_1.createMessagingSession).toHaveBeenCalledTimes(1);
    });
    it('Validates missing Contact Id', async () => {
        lambdaEvent.Details.ContactData.ContactId = '';
        lambdaEvent.Details.ContactData.InitialContactId = '';
        try {
            await (0, src_1.createMessagingSessionHandler)(lambdaEvent);
        }
        catch (error) {
            expect(error.message).toBe('ContactId is missing from ContactData.');
        }
    });
    it('Validates missing Channel Address Identifier', async () => {
        lambdaEvent.Details.ContactData.ContactId = 'contact-id';
        lambdaEvent.Details.ContactData.InitialContactId = 'contact-id';
        lambdaEvent.Details.ContactData.Attributes = {};
        try {
            await (0, src_1.createMessagingSessionHandler)(lambdaEvent);
        }
        catch (error) {
            expect(error.message).toBe('channelAddressIdentifier is missing from contact attributes.');
        }
    });
    it('Terminates execution on warming invocations', async () => {
        lambdaEvent.source = 'aws.events';
        const response = await (0, src_1.createMessagingSessionHandler)(lambdaEvent);
        expect(response).toEqual({});
    });
});
//# sourceMappingURL=createMessagingSessionHandler.test.js.map