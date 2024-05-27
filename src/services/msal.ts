import { configuration } from '@/configuration';
import {ConfidentialClientApplication, type Configuration, LogLevel} from '@azure/msal-node';

const msalConfig: Configuration = {
    auth: {
        clientId: configuration.msal.applicationId,
        authority: `https://login.microsoftonline.com/${configuration.msal.tenantId}`,
        clientSecret: configuration.msal.secret,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: LogLevel.Verbose,
        }
    }
};

export const REDIRECT_URI = new URL('/.auth/login/callback', configuration.site);
export const msal = new ConfidentialClientApplication(msalConfig);