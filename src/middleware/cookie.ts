import { configuration } from '@/configuration';
import type { User } from '@/models/user';
import type { AstroCookies } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import jwt from "jsonwebtoken";

const isUser = <TInput>(user: TInput): user is TInput & User => !!user && typeof user === 'object' && 'id' in user && 'name' in user;

function handleCookieRefresh(user: jwt.JwtPayload, cookies: AstroCookies) {
    if (!user.exp || user.exp - (Date.now() / 1000) >= configuration.jwt.expires / 2 || !isUser(user)) return;

    login(cookies, { id: user.id, name: user.name });
}

export const cookieMiddleware = defineMiddleware(async ({ cookies, locals }, next) => {
    const token = cookies.get(configuration.jwt.cookieName);
    if (!token?.value) return next();

    try {
        const user = jwt.verify(token.value, configuration.jwt.secret, { algorithms: [configuration.jwt.algorithm] });
        if (typeof user === 'string') return next();

        handleCookieRefresh(user, cookies);
        if (isUser(user)) {
            locals.user = user;
        }
    } catch (e) {
        console.error(e);
    }

    return next();
});

export function login(cookies: AstroCookies, user: User) {
    cookies.set(
        configuration.jwt.cookieName,
        jwt.sign(user, configuration.jwt.secret, { algorithm: configuration.jwt.algorithm, expiresIn: configuration.jwt.expires }),
        {
            secure: true,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        });
}