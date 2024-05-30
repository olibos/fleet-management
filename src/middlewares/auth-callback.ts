import {defineMiddleware} from 'astro:middleware';
import { msal, REDIRECT_URI } from '@/services/msal';
import type { User } from '@/models/user';
import { login } from './cookie';
import { configuration } from '@/configuration';
import { attachCookiesToResponse } from 'node_modules/astro/dist/core/cookies';

const requiredGroup = configuration.msal.requiredGroup;
export const authCallbackMiddleware = defineMiddleware(async ({ cookies, locals, redirect, url }, next) => {
    const code = url.searchParams.get('code');
    if (!code || url.pathname !== REDIRECT_URI.pathname) return next();  
        
    const tokenRequest = {
        code,
        scopes: ['User.Read'],
        redirectUri: REDIRECT_URI.toString(),
    };

    try {
        const response = await msal.acquireTokenByCode(tokenRequest);
        const idTokenClaims = response.account?.idTokenClaims;
        if (requiredGroup && idTokenClaims?.groups instanceof Array && !idTokenClaims.groups.includes(requiredGroup)) {
            return new Response('Access denied', { status: 403 });
        }
        
        const user: User = {
            id: idTokenClaims?.oid as string,
            name: response.account?.name as string
        };
        locals.user = user;
        login(cookies, user);
    } catch (error) {
        console.error('Token acquisition error:', error);
        return new Response('Failed to acquire token', { status: 500 });
    }

    const response = redirect('/');
    // TODO: Warkaround in astro -> issue to be created.
    if (!response.headers.getSetCookie()?.length) {
        for(const cookie of cookies.headers()) {
            response.headers.append("Set-Cookie", cookie);
        }
    }

    return response;
});
