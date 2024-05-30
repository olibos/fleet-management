/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />

type User = import('@/models/user').User;
declare namespace App {
    interface Locals {
        user?: User;
    }
}

interface ImportMetaEnv{
    readonly MSAL_APPLICATION_ID: string;
    readonly MSAL_APPLICATION_TENANT_ID: string;
    readonly MSAL_APPLICATION_SECRET: string;
    readonly MSAL_REQUIRED_GROUP?: string;
    readonly JWT_SECRET: string;
    readonly JWT_ALGORITHM: string;
    readonly JWT_COOKIE_NAME: string;
    readonly JWT_EXPIRES: string;
    readonly SITE: string;
    readonly DB_CONNECTION_STRING?: string;
    readonly DB_SERVER?: string;
    readonly DB_NAME?: string;
}