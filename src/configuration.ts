import type { Algorithm } from "jsonwebtoken";

const env: ImportMetaEnv = {...import.meta.env, ...process.env};
export const configuration = Object.freeze({
    msal:{
        applicationId: env.MSAL_APPLICATION_ID,
        tenantId: env.MSAL_APPLICATION_TENANT_ID,
        secret: env.MSAL_APPLICATION_SECRET,
    },
    site: new URL(env.SITE),
    jwt: {
        secret: env.JWT_SECRET,
        algorithm: (env.JWT_ALGORITHM || 'HS256') as Algorithm,
        expires: env.JWT_EXPIRES && !isNaN(+env.JWT_EXPIRES) ? +env.JWT_EXPIRES : 30 * 60,
        cookieName: env.JWT_COOKIE_NAME || '.auth',
    }
});