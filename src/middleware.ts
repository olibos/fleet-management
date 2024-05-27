import { sequence } from "astro:middleware";
import { cookieMiddleware } from "@/middlewares/cookie";
import { authMiddleware } from "@/middlewares/auth";
import { authCallbackMiddleware } from "./middlewares/auth-callback";

export const onRequest = sequence(cookieMiddleware, authCallbackMiddleware, authMiddleware);