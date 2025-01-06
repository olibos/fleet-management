import { defineMiddleware } from 'astro:middleware';
import auth from '@/services/msal';

export const authMiddleware = defineMiddleware(async ({ request, redirect, locals, url }, next) => {
    if (locals.user) return next();
    const authCodeUrlParameters = {
        scopes: ['User.Read'],
        redirectUri: auth.redirectUri.toString(),
    };

    try {
        const authUrl = await auth.msal.getAuthCodeUrl(authCodeUrlParameters);
        return redirect(authUrl);
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate authentication URL' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});