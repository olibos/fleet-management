import { sequence } from "astro:middleware";
import { cookieMiddleware } from "./cookie";
import { authMiddleware } from "./auth";
import { authCallbackMiddleware } from "./auth-callback";
import { corsMiddleware } from "./cors";

export const onRequest = sequence(/*corsMiddleware, */cookieMiddleware, authCallbackMiddleware, authMiddleware);
