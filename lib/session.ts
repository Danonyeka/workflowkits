import type { NextRequest } from "next/server";
import { AUTH_COOKIE, verifySessionToken } from "./auth";
export { getSession } from "./auth";
export function getSessionFromRequest(req: NextRequest) { return verifySessionToken(req.cookies.get(AUTH_COOKIE)?.value); }
