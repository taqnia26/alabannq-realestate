import { Router, type IRouter } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { ChangeAdminPasswordBody } from "@workspace/api-zod";
import { clearSession, currentAdmin, hashPassword, limitLogin, limitPasswordChange, newToken, sameOrigin, sessionExpiry, sessionToken, setSession, tokenHash, verifyPassword } from "../lib/adminAuth";
import { passwordPolicyError } from "../lib/passwordPolicy";

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

router.post("/auth/change-password", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
}, limitPasswordChange, async (req, res): Promise<void> => {
  try {
    const admin = await currentAdmin(req);
    if (!admin) { res.status(401).json({ error: "سجّل الدخول أولًا" }); return; }
    if (!sameOrigin(req)) { res.status(403).json({ error: "مصدر الطلب غير مسموح" }); return; }
    const parsed = ChangeAdminPasswordBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "كلمة المرور الحالية مطلوبة (حتى 1024 حرفًا)، والجديدة يجب أن تكون من 12 إلى 1024 حرفًا." });
      return;
    }
    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, admin.id)).limit(1);
    if (!user) { res.status(401).json({ error: "سجّل الدخول أولًا" }); return; }
    const { currentPassword, newPassword } = parsed.data;
    if (!await verifyPassword(currentPassword, user.passwordHash)) {
      res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة." }); return;
    }
    const policyError = passwordPolicyError(currentPassword, newPassword, user.email);
    if (policyError) { res.status(400).json({ error: policyError }); return; }
    const token = newToken();
    const passwordHash = await hashPassword(newPassword);
    // Compare-and-set: a stale request must not replace a password/session changed while hashing.
    const oldToken = sessionToken(req)!;
    const updated = await db.update(adminUsersTable)
      .set({ passwordHash, sessionTokenHash: tokenHash(token), sessionExpiresAt: sessionExpiry() })
      .where(and(eq(adminUsersTable.id, user.id), eq(adminUsersTable.passwordHash, user.passwordHash),
        eq(adminUsersTable.sessionTokenHash, tokenHash(oldToken)), gt(adminUsersTable.sessionExpiresAt, new Date())))
      .returning({ id: adminUsersTable.id });
    if (!updated.length) {
      res.status(401).json({ error: "انتهت الجلسة أو تغيرت بيانات الدخول. سجّل الدخول مجددًا." }); return;
    }
    setSession(res, token);
    res.status(204).end();
  } catch {
    // Database errors can contain SQL parameters, including hashes. Never log the error object.
    req.log.error("Admin password change could not be completed.");
    res.status(500).json({ error: "تعذر تغيير كلمة المرور. حاول مرة أخرى." });
  }
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