import { Router, type IRouter } from "express";
import { z } from "zod";
import express from "express";
import { MAX_IMAGE_SIZE, deleteUnreferencedImage, imageStream, saveImage, verifiedImage } from "../lib/siteImages";

const router: IRouter = Router();
const idSchema = z.string().uuid();
// Mounted inside the existing admin-only router.
router.post("/images", express.raw({ type: "application/octet-stream", limit: MAX_IMAGE_SIZE }), async (req, res): Promise<void> => {
  if (!Buffer.isBuffer(req.body)) { res.status(415).json({ error: "صيغة الرفع غير صالحة." }); return; }
  try {
    res.status(201).json({ imageURL: await saveImage(req.body) });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_IMAGE") {
      res.status(400).json({ error: "الصورة يجب أن تكون JPG أو PNG أو WebP وبحجم لا يتجاوز 8 ميغابايت." }); return;
    }
    req.log.error({ err }, "Failed to save image");
    res.status(503).json({ error: "تعذر حفظ الصورة. حاول مجددًا." });
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
  imageStream(image.file).on("error", err => {
    req.log.error({ err }, "Failed to stream image");
    if (!res.headersSent) res.status(503).end();
    else res.destroy(err);
  }).pipe(res);
});