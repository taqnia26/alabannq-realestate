import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db, adminUsersTable } from "@workspace/db";
import { and, eq, gt } from "drizzle-orm";
import type { CookieOptions, NextFunction, Request, Response } from "express";

const scrypt = promisify(scryptCallback);
const COOKIE = "alabnq_admin_session";
const SESSION_LENGTH = 7 * 24 * 60 * 60 * 1000;
const cookieOptions: CookieOptions = {
  httpOnly: true, secure: true, sameSite: "lax", path: "/api", maxAge: SESSION_LENGTH,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hex] = stored.split(":");
  if (!salt || !/^[0-9a-f]{32}$/.test(salt) || !/^[0-9a-f]{128}$/.test(hex || "")) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(hex, "hex"));
}

export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

function cookieToken(req: Request): string | undefined {
  const raw = req.headers.cookie?.split(";").map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`));
  const token = raw?.slice(COOKIE.length + 1);
  return token && /^[0-9a-f]{64}$/.test(token) ? token : undefined;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return true;
  try {
    const host = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
    return new URL(origin).host === host;
  } catch { return false; }
}

export async function currentAdmin(req: Request) {
  const token = cookieToken(req);
  if (!token) return null;
  const [admin] = await db.select({ id: adminUsersTable.id, email: adminUsersTable.email })
    .from(adminUsersTable)
    .where(and(eq(adminUsersTable.sessionTokenHash, tokenHash(token)),
      gt(adminUsersTable.sessionExpiresAt, new Date()))).limit(1);
  return admin || null;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!await currentAdmin(req)) { res.status(401).json({ error: "سجّل الدخول أولًا" }); return; }
    if (req.method !== "GET" && !sameOrigin(req)) {
      res.status(403).json({ error: "مصدر الطلب غير مسموح" }); return;
    }
    next();
  } catch (error) { next(error); }
}

const attempts = new Map<string, { count: number; until: number }>();
export function limitLogin(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  if (attempts.size > 2000) {
    for (const [ip, entry] of attempts) if (entry.until <= now) attempts.delete(ip);
  }
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const previous = attempts.get(ip);
  const entry = previous && previous.until > now ? previous : { count: 0, until: now + 60_000 };
  if (++entry.count > 5) {
    attempts.set(ip, entry);
    res.set("Retry-After", String(Math.ceil((entry.until - now) / 1000)));
    res.status(429).json({ error: "محاولات كثيرة، حاول بعد دقيقة." });
    return;
  }
  attempts.set(ip, entry);
  next();
}

export function setSession(res: Response, token: string): void {
  res.cookie(COOKIE, token, cookieOptions);
}

export function clearSession(res: Response): void {
  res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined });
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function sessionToken(req: Request): string | undefined {
  return cookieToken(req);
}

export const sessionExpiry = () => new Date(Date.now() + SESSION_LENGTH);