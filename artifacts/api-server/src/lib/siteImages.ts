import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { db, contentTable } from "@workspace/db";

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const prefix = "/api/media/images/";
const imageId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function managedImageId(url: string): string | null {
  if (!url.startsWith(prefix)) return null;
  const id = url.slice(prefix.length);
  return imageId.test(id) ? id : null;
}

function uploadsDir(): string {
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

export async function deleteUnreferencedImage(id: string): Promise<"deleted" | "referenced"> {
  const url = `${prefix}${id}`;
  const rows = await db.select({ data: contentTable.data }).from(contentTable);
  if (rows.some(row => {
    const data = row.data as Record<string, unknown>;
    return data.image === url || data.value === url ||
      (Array.isArray(data.gallery) && data.gallery.includes(url));
  })) return "referenced";
  try { await unlink(fileFor(id)); }
  catch (err) { if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err; }
  return "deleted";
}

export function imageReferences(data: Record<string, unknown>): string[] {
  return [
    ...(typeof data.image === "string" ? [data.image] : []),
    ...(typeof data.value === "string" ? [data.value] : []),
    ...(Array.isArray(data.gallery) ? data.gallery.filter((x): x is string => typeof x === "string") : []),
  ];
}