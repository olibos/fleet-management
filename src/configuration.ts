import type { Algorithm } from "jsonwebtoken";

const env: ImportMetaEnv = {...import.meta.env, ...process.env};

type DbSettings = { connectionString: string } | { server: string; database: string; };

function getDbSettings(): DbSettings {
    if (env.DB_CONNECTION_STRING) {
        return {
            connectionString: env.DB_CONNECTION_STRING
        }
    }

    if (env.DB_SERVER && env.DB_NAME) {
        return {
            server: env.DB_SERVER,
            database: env.DB_NAME
        }
    }

    throw new Error("Missing DB Settings.")
}

export const configuration = Object.freeze({
    msal:{
        applicationId: env.MSAL_APPLICATION_ID,
        tenantId: env.MSAL_APPLICATION_TENANT_ID,
        secret: env.MSAL_APPLICATION_SECRET,
        requiredGroup: env.MSAL_REQUIRED_GROUP,
    },
    db: getDbSettings(),
    site: new URL(env.SITE),
    jwt: {
        secret: env.JWT_SECRET,
        algorithm: (env.JWT_ALGORITHM || 'HS256') as Algorithm,
        expires: env.JWT_EXPIRES && !isNaN(+env.JWT_EXPIRES) ? +env.JWT_EXPIRES : 30 * 60,
        cookieName: env.JWT_COOKIE_NAME || '.auth',
    }
});