"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUpdateConnectedApp = exports.connectedAppManagerHandler = void 0;
const constants_1 = require("../utils/constants");
const sfResourceCreationHandler_1 = require("./sfResourceCreationHandler");
const secretsManager_1 = require("../secretsManager");
const common_1 = require("../utils/common");
const axios_1 = __importDefault(require("axios"));
async function connectedAppManagerHandler(event) {
    const { RequestId, RequestType, ResourceProperties } = event;
    const { ConnectedAppAPIName, ConnectedAppAction } = ResourceProperties;
    let connectedApp = null;
    switch (RequestType) {
        case 'Create':
            // Handle resource creation
            console.log('Creating ConnectedAppManager CFN resource');
            try {
                connectedApp = await readUpdateConnectedApp(ConnectedAppAPIName, ConnectedAppAction);
            }
            catch (e) {
                console.error(`Error calling ConnectedAppManager to read or update ConnectedApp: ${ConnectedAppAPIName}`, e);
                await sendResponse(event, 'FAILED', RequestId);
                throw e;
            }
            await sendResponse(event, 'SUCCESS', RequestId, { connectedApp });
            return;
        case 'Update':
            // Handle resource update
            console.log('No logic implemented for Updating ConnectedAppManager CFN resource');
            const updateEvent = event;
            await sendResponse(event, 'SUCCESS', updateEvent.PhysicalResourceId, {});
            return;
        case 'Delete':
            // Handle resource deletion
            console.log('Deleting ConnectedAppManager CFN resource');
            const deleteEvent = event;
            await sendResponse(event, 'SUCCESS', deleteEvent.PhysicalResourceId);
            return;
        default:
            const errorMsg = `Unsupported request type: ${RequestType}`;
            console.error(errorMsg);
            await sendResponse(event, 'FAILED', RequestId, {}, errorMsg);
            throw new Error(errorMsg);
    }
}
exports.connectedAppManagerHandler = connectedAppManagerHandler;
async function sendResponse(event, status, physicalResourceId, data, reason) {
    const response = {
        Status: status,
        Reason: reason || 'See the details in CloudWatch Log Stream: ',
        PhysicalResourceId: physicalResourceId,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: data,
    };
    await axios_1.default.put(event.ResponseURL, response);
}
async function readUpdateConnectedApp(connectedAppName, connectedAppAction) {
    if (connectedAppAction !== constants_1.READ_CONNECTED_APP_ACTION && connectedAppAction !== constants_1.UPDATE_CONNECTED_APP_ACTION) {
        throw new Error("Unexpected operation to connectedAppManagerHandler, only valid actions are 'Read' and 'Update'");
    }
    try {
        const secretsRawString = await (0, secretsManager_1.getSecretValue)((0, common_1.getEnvironmentVariable)(constants_1.SECRET_ENV_VAR_KEY));
        const secretsParsed = JSON.parse(secretsRawString);
        const domainUrl = (0, common_1.getEnvironmentVariable)(constants_1.AUTH_DOMAIN_URL);
        if (!secretsParsed[constants_1.CONSUMER_KEY] || !secretsParsed[constants_1.CONSUMER_SECRET]) {
            throw new Error('Consumer Key or Secret cannot be empty, please update the SCC-Secrets');
        }
        if (connectedAppAction === constants_1.UPDATE_CONNECTED_APP_ACTION) {
            console.log(`Updating ConnectedApp: ${connectedAppName} with new certificate`);
            if (secretsParsed[constants_1.CERT_PUBLIC_KEY]) {
                await (0, sfResourceCreationHandler_1.updateConnectedAppWithCertificateHandler)(domainUrl, secretsParsed[constants_1.CONSUMER_KEY], secretsParsed[constants_1.CONSUMER_SECRET], connectedAppName, secretsParsed[constants_1.CERT_PUBLIC_KEY]);
            }
            else {
                throw new Error('New Certificate Public Key cannot be empty, please update the SCC-Secrets');
            }
        }
        console.log(`Reading Connected App: ${connectedAppName}`);
        return (await (0, sfResourceCreationHandler_1.readConnectedAppHandler)(domainUrl, secretsParsed[constants_1.CONSUMER_KEY], secretsParsed[constants_1.CONSUMER_SECRET], connectedAppName));
    }
    catch (e) {
        console.error(`Found error while ${connectedAppAction === constants_1.UPDATE_CONNECTED_APP_ACTION ? 'updating' : 'reading'} ConnectedApp: `, e);
        throw e;
    }
}
exports.readUpdateConnectedApp = readUpdateConnectedApp;
//# sourceMappingURL=connectedAppManagerHandler.js.map