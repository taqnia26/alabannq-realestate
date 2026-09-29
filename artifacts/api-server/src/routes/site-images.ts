import { Router, type IRouter } from "express";
import { z } from "zod";
import { IMAGE_TYPES, MAX_IMAGE_SIZE, deleteUnreferencedImage, requestImageUpload, verifiedImage } from "../lib/siteImages";

const router: IRouter = Router();
const idSchema = z.string().uuid();
const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().min(1).max(MAX_IMAGE_SIZE),
  contentType: z.enum(IMAGE_TYPES),
});

// Mounted inside the existing admin-only router.
router.post("/images", async (req, res): Promise<void> => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "الصورة يجب أن تكون JPG أو PNG أو WebP أو GIF وبحجم لا يتجاوز 8 ميغابايت." }); return; }
  try {
    res.json(await requestImageUpload());
  } catch (err) {
    req.log.error({ err }, "Failed to request image upload");
    res.status(503).json({ error: "تعذر تجهيز رفع الصورة. حاول مجددًا." });
  }
});

router.delete("/images/:id", async (req, res): Promise<void> => {
  const parsed = idSchema.safeParse(req.params.id);
  if (!parsed.success) { res.status(400).json({ error: "معرّف الصورة غير صالح" }); return; }
  const result = await deleteUnreferencedImage(parsed.data);
  if (result === "referenced") { res.status(409).json({ error: "الصورة لا تزال مستخدمة في الموقع. احفظ إزالة الصورة أولًا." }); return; }
  res.status(204).end();
});

export default router;

export const imageRouter: IRouter = Router();
imageRouter.get("/media/images/:id", async (req, res): Promise<void> => {
  const parsed = idSchema.safeParse(req.params.id);
  if (!parsed.success) { res.status(404).end(); return; }
  const image = await verifiedImage(parsed.data);
  if (!image) { res.status(404).end(); return; }
  res.set({
    "Content-Type": image.contentType,
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=3600",
  });
  image.file.createReadStream().on("error", err => {
    req.log.error({ err }, "Failed to stream image");
    if (!res.headersSent) res.status(503).end();
    else res.destroy(err);
  }).pipe(res);
});