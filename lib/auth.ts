// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcryptjs"; // ← namespace import works in all TS configs

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

export type User = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
};

function ensureUsersFile() {
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "[]", "utf8");
}

export function readUsers(): User[] {
  ensureUsersFile();
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}

export function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function setSessionCookie(payload: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  cookies().set("wk_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set("wk_session", "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getSession(): { id: string; email: string } | null {
  const token = cookies().get("wk_session")?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret) as any;
  } catch {
    return null;
  }
}
