import { sequence } from "astro:middleware";
import { cookieMiddleware } from "./cookie";
import { authMiddleware } from "./auth";
import { authCallbackMiddleware } from "./auth-callback";

// TODO: Add corsMiddleware.
export const onRequest = sequence(cookieMiddleware, authCallbackMiddleware, authMiddleware);
