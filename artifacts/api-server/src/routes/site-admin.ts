import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, contentTable, visitsTable, inquiriesTable } from "@workspace/db";
import { eq, gte, sql, desc } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();
const kinds = ["properties", "articles", "campaigns"] as const;
const idSchema = z.string().min(1).max(130).regex(/^[a-zA-Z0-9_-]+$/);
const itemSchema = z.object({ id: idSchema }).passthrough();
const siteSchema = z.object({ key: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_.-]+$/), value: z.string().max(15000) });
const trackSchema = z.object({
  path: z.string().startsWith("/").max(250),
  session: z.string().uuid(),
  campaign: z.string().max(120).optional(),
  channel: z.string().max(120).optional(),
});
const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(9).max(30),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  message: z.string().trim().min(10).max(4000),
});

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: "سجّل الدخول أولًا" }); return; }
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses.find(entry => entry.id === user.primaryEmailAddressId);
    if (!email || email.emailAddress.toLowerCase() !== "info@alabannaq.com" ||
      email.verification?.status !== "verified") {
      res.status(403).json({ error: "هذا الحساب لا يملك صلاحية الإدارة" }); return;
    }
    if (req.method !== "GET") {
      const origin = req.get("origin");
      const host = req.get("x-forwarded-host")?.split(",")[0] || req.get("host");
      if (origin && new URL(origin).host !== host) {
        res.status(403).json({ error: "مصدر الطلب غير مسموح" }); return;
      }
    }
    next();
  } catch (error) { next(error); }
}

router.get("/content", async (_req, res): Promise<void> => {
  const entries = await db.select().from(contentTable);
  res.set("Cache-Control", "no-store");
  res.json({
    properties: entries.filter(x => x.kind === "properties").map(x => ({ ...x.data, id: x.id, published: x.published })),
    articles: entries.filter(x => x.kind === "articles").map(x => ({ ...x.data, id: x.id, published: x.published })),
    site: Object.fromEntries(entries.filter(x => x.kind === "site").map(x => [x.id, x.data.value])),
  });
});

router.post("/track", async (req, res): Promise<void> => {
  const parsed = trackSchema.safeParse(req.body);
  if (!parsed.success || parsed.data.path.startsWith("/admin") || parsed.data.path.startsWith("/sign-in")) {
    res.status(400).json({ error: "بيانات الزيارة غير صالحة" }); return;
  }
  const { path, session, campaign, channel } = parsed.data;
  await db.insert(visitsTable).values({ path, session, campaign: campaign || null, channel: channel || null });
  res.status(204).end();
});
router.post("/inquiries", async (req, res): Promise<void> => {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "يرجى مراجعة بيانات النموذج" }); return; }
  const { name, phone, email, message } = parsed.data;
  await db.insert(inquiriesTable).values({ name, phone, email: email || null, message });
  res.status(201).json({ received: true });
});

router.use("/admin", requireAdmin);

router.get("/admin/state", async (_req, res): Promise<void> => {
  const entries = await db.select().from(contentTable);
  const [totals, daily, topPages, campaignVisits, inquiries] = await Promise.all([
    db.select({
      total: sql<number>`count(*)::int`,
      last7: sql<number>`count(*) filter (where ${visitsTable.occurredAt} >= now() - interval '7 days')::int`,
      today: sql<number>`count(*) filter (where ${visitsTable.occurredAt} >= current_date)::int`,
    }).from(visitsTable),
    db.select({ date: sql<string>`to_char(${visitsTable.occurredAt} at time zone 'Asia/Riyadh', 'YYYY-MM-DD')`, visits: sql<number>`count(*)::int` })
      .from(visitsTable).where(gte(visitsTable.occurredAt, sql`now() - interval '30 days'`))
      .groupBy(sql`to_char(${visitsTable.occurredAt} at time zone 'Asia/Riyadh', 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${visitsTable.occurredAt} at time zone 'Asia/Riyadh', 'YYYY-MM-DD')`),
    db.select({ path: visitsTable.path, visits: sql<number>`count(*)::int` }).from(visitsTable).groupBy(visitsTable.path).orderBy(desc(sql`count(*)`)).limit(8),
    db.select({ campaign: visitsTable.campaign, visits: sql<number>`count(*)::int` }).from(visitsTable)
      .where(sql`${visitsTable.campaign} is not null`).groupBy(visitsTable.campaign).orderBy(desc(sql`count(*)`)).limit(8),
    db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt)).limit(100),
  ]);
  res.set("Cache-Control", "no-store");
  res.json({
    properties: entries.filter(x => x.kind === "properties").map(x => ({ ...x.data, id: x.id, published: x.published })),
    articles: entries.filter(x => x.kind === "articles").map(x => ({ ...x.data, id: x.id, published: x.published })),
    campaigns: entries.filter(x => x.kind === "campaigns").map(x => ({ ...x.data, id: x.id })),
    inquiries,
    site: Object.fromEntries(entries.filter(x => x.kind === "site").map(x => [x.id, x.data.value])),
    stats: { ...(totals[0] || { total: 0, last7: 0, today: 0 }), daily, topPages, campaignVisits },
  });
});
router.patch("/admin/inquiries/:id/read", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({ error: "معرّف غير صالح" }); return; }
  const [item] = await db.update(inquiriesTable).set({ read: true }).where(eq(inquiriesTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "الرسالة غير موجودة" }); return; }
  res.json(item);
});

async function saveItem(req: Request, res: Response): Promise<void> {
  const kind = Array.isArray(req.params.kind) ? req.params.kind[0] : req.params.kind;
  if (!kinds.includes(kind as typeof kinds[number])) { res.status(400).json({ error: "نوع المحتوى غير صالح" }); return; }
  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success || (req.params.id && req.params.id !== parsed.data.id) ||
    JSON.stringify(req.body).length > 40000) {
    res.status(400).json({ error: "بيانات المحتوى غير صالحة" }); return;
  }
  const { id, published, ...data } = parsed.data;
  if (kind === "properties" && data.city !== "مكة المكرمة") {
    res.status(400).json({ error: "العروض متاحة في مكة المكرمة فقط" }); return;
  }
  const [item] = await db.insert(contentTable).values({ id, kind, data, published: published !== false })
    .onConflictDoUpdate({ target: contentTable.id, set: { kind, data, published: published !== false, updatedAt: new Date() } }).returning();
  res.json({ ...item.data, id: item.id, published: item.published });
}
router.post("/admin/items/:kind", saveItem);
router.put("/admin/items/:kind/:id", saveItem);
router.delete("/admin/items/:kind/:id", async (req, res): Promise<void> => {
  const kind = Array.isArray(req.params.kind) ? req.params.kind[0] : req.params.kind;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!kinds.includes(kind as typeof kinds[number]) || !idSchema.safeParse(id).success) {
    res.status(400).json({ error: "معرّف غير صالح" }); return;
  }
  // Tombstones stop static catalog items from reappearing after removal.
  await db.insert(contentTable).values({ id, kind, data: { id, deleted: true }, published: false })
    .onConflictDoUpdate({ target: contentTable.id, set: { data: { id, deleted: true }, published: false, updatedAt: new Date() } });
  res.status(204).end();
});
router.put("/admin/site", async (req, res): Promise<void> => {
  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "قيمة غير صالحة" }); return; }
  const { key, value } = parsed.data;
  await db.insert(contentTable).values({ id: key, kind: "site", data: { value } })
    .onConflictDoUpdate({ target: contentTable.id, set: { data: { value }, updatedAt: new Date() } });
  res.json({ key, value });
});
export default router;