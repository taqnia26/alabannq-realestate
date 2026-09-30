import { Router, type IRouter } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { clearSession, currentAdmin, limitLogin, newToken, sameOrigin, sessionExpiry, sessionToken, setSession, tokenHash, verifyPassword } from "../lib/adminAuth";

const router: IRouter = Router();
const credentials = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1024),
});
const failure = { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };

router.post("/auth/login", limitLogin, async (req, res): Promise<void> => {
  if (!sameOrigin(req)) { res.status(403).json({ error: "مصدر الطلب غير مسموح" }); return; }
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) { res.status(401).json(failure); return; }
  const email = parsed.data.email.toLowerCase();
  const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email)).limit(1);
  // Perform the same expensive verification for unknown users, too.
  const fallback = "00000000000000000000000000000000:" + "0".repeat(128);
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash || fallback);
  if (!user || !valid) { res.status(401).json(failure); return; }
  const token = newToken();
  await db.update(adminUsersTable).set({ sessionTokenHash: tokenHash(token), sessionExpiresAt: sessionExpiry() })
    .where(eq(adminUsersTable.id, user.id));
  setSession(res, token);
  res.set("Cache-Control", "no-store");
  res.json({ email: user.email });
});

router.get("/auth/session", async (req, res): Promise<void> => {
  const user = await currentAdmin(req);
  res.set("Cache-Control", "no-store");
  if (!user) { res.status(401).json({ error: "سجّل الدخول أولًا" }); return; }
  res.json({ email: user.email });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  if (!sameOrigin(req)) { res.status(403).end(); return; }
  const token = sessionToken(req);
  if (token) await db.update(adminUsersTable)
    .set({ sessionTokenHash: null, sessionExpiresAt: null })
    .where(eq(adminUsersTable.sessionTokenHash, tokenHash(token)));
  clearSession(res);
  res.status(204).end();
});

export default router;