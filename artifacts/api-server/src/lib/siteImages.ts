import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { db, contentTable } from "@workspace/db";

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] as const;
const prefix = "/api/media/images/";
const imageId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let imageMutationTail: Promise<void> = Promise.resolve();

/** Serializes content/reference mutations with filesystem deletion in this API process. */
export async function withImageMutationLock<T>(operation: () => Promise<T>): Promise<T> {
  const previous = imageMutationTail;
  let release!: () => void;
  imageMutationTail = new Promise<void>(resolve => { release = resolve; });
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}

export function managedImageId(url: string): string | null {
  if (!url.startsWith(prefix)) return null;
  const id = url.slice(prefix.length);
  return imageId.test(id) ? id : null;
}

export function uploadsDir(): string {
  const dir = process.env.UPLOADS_DIR;
  if (!dir || !path.isAbsolute(dir)) throw new Error("UPLOADS_DIR must be an absolute path");
  const resolved = path.resolve(dir);
  const apiBuild = path.resolve(process.cwd(), "dist");
  if (resolved === apiBuild || resolved.startsWith(apiBuild + path.sep))
    throw new Error("UPLOADS_DIR must be outside the build output");
  return resolved;
}

function fileFor(id: string): string {
  if (!imageId.test(id)) throw new Error("Invalid image identifier");
  return path.join(uploadsDir(), id);
}

function detectedType(bytes: Buffer): typeof IMAGE_TYPES[number] | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  const gifSignature = bytes.toString("ascii", 0, 6);
  if (gifSignature === "GIF87a" || gifSignature === "GIF89a") return "image/gif";
  if (bytes.length >= 16 && bytes.toString("ascii", 4, 8) === "ftyp") {
    const boxSize = bytes.readUInt32BE(0);
    if (boxSize >= 16 && boxSize <= bytes.length) {
      const isAvifBrand = (offset: number) => {
        const brand = bytes.toString("ascii", offset, offset + 4);
        return brand === "avif" || brand === "avis";
      };
      if (isAvifBrand(8)) return "image/avif";
      for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
        if (isAvifBrand(offset)) return "image/avif";
      }
    }
  }
  return null;
}

export async function saveImage(bytes: Buffer): Promise<string> {
  if (!bytes.length || bytes.length > MAX_IMAGE_SIZE || !detectedType(bytes)) throw new Error("INVALID_IMAGE");
  const id = randomUUID();
  await mkdir(uploadsDir(), { recursive: true, mode: 0o700 });
  const file = await open(fileFor(id), "wx", 0o600);
  try { await file.writeFile(bytes); }
  catch (err) { await file.close(); await unlink(fileFor(id)); throw err; }
  await file.close();
  return `${prefix}${id}`;
}

export async function verifiedImage(id: string) {
  const file = fileFor(id);
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size < 1 || info.size > MAX_IMAGE_SIZE) return null;
    const bytes = await readFile(file);
    const contentType = detectedType(bytes);
    return contentType ? { file, contentType } : null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export function imageStream(file: string) {
  return createReadStream(file);
}

export async function validateImageReferences(urls: string[]): Promise<boolean> {
  for (const url of urls) {
    if (url.startsWith(prefix) && (!managedImageId(url) || !await verifiedImage(managedImageId(url)!))) return false;
  }
  return true;
}

/** Caller must hold withImageMutationLock; cleanup invokes this while already holding the lock. */
export async function deleteUnreferencedImage(id: string): Promise<"deleted" | "referenced"> {
  const url = `${prefix}${id}`;
  const rows = await db.select({ data: contentTable.data }).from(contentTable);
  if (rows.some(row => imageReferences(row.data as Record<string, unknown>).includes(url))) return "referenced";
  try { await unlink(fileFor(id)); }
  catch (err) { if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err; }
  return "deleted";
}

export function imageReferences(data: Record<string, unknown>): string[] {
  const value = typeof data.value === "string" ? data.value : undefined;
  let sliderImages: string[] = [];
  if (value !== undefined && value.length > 0) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const slides = (parsed as { slides?: unknown }).slides;
        if (Array.isArray(slides)) {
          sliderImages = slides.flatMap((slide: unknown) => {
            if (!slide || typeof slide !== "object" || Array.isArray(slide)) return [];
            const image = (slide as { image?: unknown }).image;
            return typeof image === "string" ? [image] : [];
          });
        }
      }
    } catch {
      // Ordinary site values are not JSON; only serialized slider values add nested references.
    }
  }
  return [
    ...(typeof data.image === "string" ? [data.image] : []),
    ...(value !== undefined ? [value, ...sliderImages] : []),
    ...(Array.isArray(data.gallery) ? data.gallery.filter((x): x is string => typeof x === "string") : []),
  ];
}