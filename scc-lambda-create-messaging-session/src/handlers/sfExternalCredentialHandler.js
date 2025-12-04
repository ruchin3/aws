"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExternalCredentialHandler = void 0;
const auth_1 = require("../utils/auth");
const lambda_1 = require("../utils/lambda");
async function updateExternalCredentialHandler(event) {
    const { ResourceProperties, RequestId, RequestType } = event;
    const externalCredentialName = ResourceProperties['ExternalCredentialName'];
    const certificateName = ResourceProperties['CertificateName'];
    switch (RequestType) {
        case 'Create':
            console.log(`Updating external Credential ${externalCredentialName} with certificate ${certificateName}`);
            try {
                const conn = await (0, auth_1.generateSFConnection)();
                // Read the ExternalCredential metadata
                const externalCredential = await (0, auth_1.getExternalCredential)(conn, externalCredentialName);
                if (externalCredential == null) {
                    const errorMessage = `No External Credential found with the specified name ${externalCredentialName}.`;
                    console.log(errorMessage);
                    await (0, lambda_1.sendResponse)(event, 'FAILED', RequestId, {}, errorMessage);
                    throw new Error(errorMessage);
                }
                // Construct request body
                const externalCredentialParameters = externalCredential.Metadata.externalCredentialParameters;
                externalCredentialParameters.map((externalCredentialParameter) => {
                    if (externalCredentialParameter.parameterType == 'SigningCertificate') {
                        externalCredentialParameter.certificate = certificateName;
                    }
                    else if (externalCredentialParameter.parameterType == 'JwtHeaderClaim' && externalCredentialParameter.parameterName == 'kid') {
                        externalCredentialParameter.parameterValue = certificateName;
                    }
                });
                const requestBody = {
                    FullName: externalCredential.FullName,
                    Metadata: externalCredential.Metadata,
                };
                // Update the external credential
                await conn.requestPatch(`/services/data/v61.0/tooling/sobjects/ExternalCredential/${externalCredential.Id}`, requestBody);
                console.log(`External Credential ${externalCredentialName} updated with certificate ${certificateName}`);
                await (0, lambda_1.sendResponse)(event, 'SUCCESS', RequestId, {});
                return {
                    status: 'SUCCESS',
                };
            }
            catch (error) {
                const errorMessage = `Error updating External Credential: ${externalCredentialName} with certificate ${certificateName}`;
                console.error(errorMessage, error);
                await (0, lambda_1.sendResponse)(event, 'FAILED', RequestId, {}, errorMessage);
                throw error;
            }
        case 'Delete':
            // Handle resource deletion
            console.log('No logic implemented for deleting External Credential CFN resource');
            const deleteEvent = event;
            await (0, lambda_1.sendResponse)(event, 'SUCCESS', deleteEvent.PhysicalResourceId);
            return {
                status: 'SUCCESS',
            };
        default:
            const errorMsg = `Unsupported request type: ${RequestType}`;
            console.error(errorMsg);
            await (0, lambda_1.sendResponse)(event, 'FAILED', RequestId, {}, errorMsg);
            throw new Error(errorMsg);
    }
}
exports.updateExternalCredentialHandler = updateExternalCredentialHandler;
//# sourceMappingURL=sfExternalCredentialHandler.js.map