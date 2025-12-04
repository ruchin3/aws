"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConversationHistory = exports.sendEntryInteractionMessage = exports.createMessagingSession = exports.routeWorkItem = exports.conversationHistoryRequest = exports.interactionsRequest = void 0;
const common_1 = require("./utils/common");
const constants_1 = require("./utils/constants");
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const axios_2 = require("axios");
const auth_1 = require("./utils/auth");
const auth_2 = require("./utils/auth");
const sleep_1 = require("./utils/sleep");
async function getAxiosInstance() {
    const baseURL = (0, common_1.getEnvironmentVariable)(constants_1.SCRT2_DOMAIN_URL);
    return axios_1.default.create({
        baseURL: baseURL,
    });
}
const interactionsRequest = async (data) => {
    return sendPostRequestWithRetry(sendMultipartPostRequest, '/api/v1/interactions', data);
};
exports.interactionsRequest = interactionsRequest;
const conversationHistoryRequest = async (data) => {
    return sendPostRequestWithRetry(sendPostRequest, '/api/v1/conversationHistory', data, {
        AuthorizationContextType: 'ConversationChannelDefinition',
    });
};
exports.conversationHistoryRequest = conversationHistoryRequest;
const routeWorkItem = async (data) => {
    return sendPostRequestWithRetry(sendPostRequest, '/api/v1/route', data);
};
exports.routeWorkItem = routeWorkItem;
const createMessagingSession = async (clientId, channelAddressIdentifier) => {
    const id = (0, uuid_1.v4)();
    const entryInteractionMessage = {
        timestamp: Date.now(),
        interactionType: 'EntryInteraction',
        payload: {
            id,
            entryType: 'Message',
            abstractMessage: {
                messageType: 'StaticContentMessage',
                id,
                staticContent: {
                    formatType: 'Text',
                    text: '',
                },
            },
        },
    };
    const messagingSession = await (0, exports.sendEntryInteractionMessage)(clientId, channelAddressIdentifier, entryInteractionMessage);
    console.log('Successfully created messaging session', messagingSession);
    return messagingSession;
};
exports.createMessagingSession = createMessagingSession;
const sendEntryInteractionMessage = async (clientId, channelAddressIdentifier, entryInteractionMessage) => {
    const data = {
        to: channelAddressIdentifier,
        from: clientId,
        interactions: [entryInteractionMessage],
    };
    const response = await (0, exports.interactionsRequest)(data);
    console.log('Successfully sent EntryInteraction message', response.data);
    return response.data;
};
exports.sendEntryInteractionMessage = sendEntryInteractionMessage;
const sendConversationHistory = async (channelAddressIdentifier, conversationParticipants, conversationEntries) => {
    const data = {
        channelAddressIdentifier,
        conversationParticipants,
        conversationEntries,
    };
    const response = await (0, exports.conversationHistoryRequest)(data);
    console.log('Successfully sent ConversationHistory messages', response.data);
    return response.data;
};
exports.sendConversationHistory = sendConversationHistory;
const sendPostRequestWithRetry = async (sendPostRequestFunction, url, data, headers = {}) => {
    let response;
    let accessToken = await (0, auth_2.fetchAccessToken)();
    try {
        response = await sendPostRequestFunction(accessToken, url, data, headers);
    }
    catch (err) {
        if ((0, axios_2.isAxiosError)(err) && constants_1.retryableStatusCodes.includes(err.response?.status)) {
            console.log('Server error, retrying', err);
            await (0, sleep_1.sleep)(1000);
            response = await sendPostRequestFunction(accessToken, url, data, headers);
        }
        else if ((0, axios_2.isAxiosError)(err) && (err.response?.status === 403 || err.response?.status == 401)) {
            console.log('Token is invalid, retrying with refreshed access token');
            accessToken = await (0, auth_1.refreshAccessToken)();
            response = await sendPostRequestFunction(accessToken, url, data, headers);
        }
        else {
            console.error('sendPostRequestWithRetry error: ', err);
            throw err;
        }
    }
    return response;
};
const sendPostRequest = async (accessToken, url, data, additionalHeaders) => {
    const axiosInstance = await getAxiosInstance();
    const orgId = (0, common_1.getSalesforceOrganizationId)();
    const requestId = (0, uuid_1.v4)();
    const headers = {
        'Content-Type': 'application/json',
        OrgId: orgId,
        AuthorizationContext: constants_1.SALESFORCE_INTERACTION_SERVICE_AUTHORIZATION_CONTEXT,
        Authorization: 'Bearer ' + accessToken,
        RequestId: requestId,
        ...additionalHeaders,
    };
    console.log(`Sending request with Id ${requestId} to ${url}`);
    const startTime = Date.now();
    const response = await axiosInstance.post(url, data, { headers });
    const duration = Date.now() - startTime;
    console.log(`Request with Id ${requestId} to ${url} completed in ${duration} ms`);
    return response;
};
const sendMultipartPostRequest = async (accessToken, url, data, additionalHeaders) => {
    const axiosInstance = await getAxiosInstance();
    const orgId = (0, common_1.getSalesforceOrganizationId)();
    const requestId = (0, uuid_1.v4)();
    const headers = {
        OrgId: orgId,
        AuthorizationContext: constants_1.SALESFORCE_INTERACTION_SERVICE_AUTHORIZATION_CONTEXT,
        Authorization: 'Bearer ' + accessToken,
        RequestId: requestId,
        ...additionalHeaders,
    };
    console.log(`Sending multipart request with Id ${requestId} to ${url}`);
    const formData = new FormData();
    formData.append('json', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const startTime = Date.now();
    const response = await axiosInstance.post(url, formData, { headers });
    const duration = Date.now() - startTime;
    console.log(`Multipart request with Id ${requestId} to ${url} completed in ${duration} ms`);
    return response;
};
//# sourceMappingURL=interactionService.js.map