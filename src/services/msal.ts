import { configuration } from '@/configuration';
import {ConfidentialClientApplication, LogLevel} from '@azure/msal-node';

let _redirectUri: URL;
let _msal: ConfidentialClientApplication
export default {
    get redirectUri() {
        _redirectUri ??= new URL('/.auth/login/callback', configuration.site);
        return _redirectUri;
    },
    get msal() {
        _msal ??= new ConfidentialClientApplication({
            auth: {
                clientId: configuration.msal.applicationId,
                authority: `https://login.microsoftonline.com/${configuration.msal.applicationTenantId}`,
                clientSecret: configuration.msal.applicationSecret,
            },
            system: {
                loggerOptions: {
                    loggerCallback(_loglevel, message, _containsPii) {
                        console.log(message);
                    },
                    piiLoggingEnabled: false,
                    logLevel: LogLevel.Verbose,
                }
            }
        });
        return _msal;
    }
}
