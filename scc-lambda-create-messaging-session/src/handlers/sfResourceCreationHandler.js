"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConnectedAppWithCertificateHandler = exports.readConnectedAppHandler = exports.createConnectedAppForInteractionApiHandler = void 0;
const connection_1 = require("@jsforce/jsforce-node/lib/connection");
const uuid_1 = require("uuid");
async function readConnectedAppHandler(domainURL, //Get this Value from Lambda System Params
consumerKey, // Get this Value from Secrets
consumerSecret, //Get this Value from Secrets
connectedAppName //Get this Value from Lambda Handler Param, it should be full named Example = awsac__ConnectedAppName
) {
    try {
        const conn = new connection_1.Connection({
            instanceUrl: domainURL,
            oauth2: {
                clientId: consumerKey,
                clientSecret: consumerSecret,
                loginUrl: domainURL,
            },
            version: '61.0',
        });
        await conn.authorize({ grant_type: 'client_credentials' });
        // Read the connected app metadata
        const results = await conn.metadata.read('ConnectedApp', [connectedAppName]);
        if (results.length !== 1 || results[0].fullName == undefined) {
            throw new Error('No Connected App found with the specified name.');
        }
        // Assuming results[0] is the Connected App metadata
        const connectedApp = results[0];
        // Parse and display specific details if needed
        const { fullName, label, contactEmail, oauthConfig, profileName } = connectedApp;
        console.log('Parsed Connected App Details:');
        console.log(`Full Name: ${fullName}`);
        console.log(`Label: ${label}`);
        console.log(`Contact Email: ${contactEmail}`);
        console.log(`OAuth Config: ${JSON.stringify(oauthConfig, null, 2)}`);
        console.log(`Profile Name(s): ${profileName.join(', ')}`);
        return connectedApp;
    }
    catch (error) {
        console.error('Error reading ConnectedApp metadata: ', error);
        throw error;
    }
}
exports.readConnectedAppHandler = readConnectedAppHandler;
async function updateConnectedAppWithCertificateHandler(domainURL, consumerKey, consumerSecret, connectedAppName, newCertificate) {
    try {
        const conn = new connection_1.Connection({
            instanceUrl: domainURL,
            oauth2: {
                clientId: consumerKey,
                clientSecret: consumerSecret,
                loginUrl: domainURL,
            },
            version: '61.0',
        });
        await conn.authorize({ grant_type: 'client_credentials' });
        // Read the connectedApp metadata
        const results = await conn.metadata.read('ConnectedApp', [connectedAppName]);
        if (results.length !== 1 || results[0].fullName == undefined) {
            throw new Error('No Connected App found with the specified name.');
        }
        // Assuming results[0] is the Connected App metadata
        const connectedApp = results[0];
        console.log('Connected App Details:', JSON.stringify(connectedApp, null, 2));
        // Modify the OAuth certificate
        if (connectedApp.oauthConfig != null)
            connectedApp.oauthConfig.certificate = newCertificate;
        // Update the connected app
        const connectedAppResult = await conn.metadata.update('ConnectedApp', connectedApp);
        console.log('Connected App updated:', JSON.stringify(connectedAppResult, null, 2));
        if (!connectedAppResult.success) {
            throw new Error('Failed to update ConnectedApp with new Certificate');
        }
    }
    catch (error) {
        console.error('Error updating ConnectedApp:', error);
        throw error;
    }
}
exports.updateConnectedAppWithCertificateHandler = updateConnectedAppWithCertificateHandler;
async function createConnectedAppForInteractionApiHandler(domainURL, clientId, clientSecret, connectedAppName, adminEmail, certificateContent) {
    try {
        const conn = new connection_1.Connection({
            instanceUrl: domainURL,
            oauth2: {
                clientId: clientId,
                clientSecret: clientSecret,
                loginUrl: domainURL,
            },
            version: '61.0',
        });
        await conn.authorize({ grant_type: 'client_credentials' });
        // Build connected app metadata
        const connectedAppMetadata = {
            fullName: connectedAppName,
            label: connectedAppName,
            contactEmail: adminEmail,
            oauthConfig: {
                callbackUrl: 'https://salesforce.com',
                scopes: ['RefreshToken', 'Interaction'],
                certificate: certificateContent,
                consumerKey: (0, uuid_1.v4)(),
                isAdminApproved: true,
                isClientCredentialEnabled: false,
                isCodeCredentialEnabled: false,
                isCodeCredentialPostOnly: false,
                isConsumerSecretOptional: false,
                isIntrospectAllTokens: false,
                isNamedUserJwtEnabled: true,
                isPkceRequired: true,
                isRefreshTokenRotationEnabled: false,
                isSecretRequiredForRefreshToken: true,
                isSecretRequiredForTokenExchange: false,
                isTokenExchangeEnabled: false,
            },
            oauthPolicy: {
                ipRelaxation: 'ENFORCE',
                refreshTokenPolicy: 'infinite',
            },
            profileName: ['System Administrator'],
        };
        // Create connected app and log results
        const connectedAppResult = await conn.metadata.create('ConnectedApp', connectedAppMetadata);
        console.log(JSON.stringify(connectedAppResult));
    }
    catch (error) {
        console.error('Error creating ConnectedApp :', error);
        throw error;
    }
}
exports.createConnectedAppForInteractionApiHandler = createConnectedAppForInteractionApiHandler;
//# sourceMappingURL=sfResourceCreationHandler.js.map