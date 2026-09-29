import { randomUUID } from "node:crypto";
import { Storage } from "@google-cloud/storage";
import { db, contentTable } from "@workspace/db";

const sidecar = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${sidecar}/token`,
    type: "external_account",
    credential_source: {
      url: `${sidecar}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const prefix = "/api/media/images/";
const imageId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function managedImageId(url: string): string | null {
  if (!url.startsWith(prefix)) return null;
  const id = url.slice(prefix.length);
  return imageId.test(id) ? id : null;
}

function fileFor(id: string) {
  if (!imageId.test(id)) throw new Error("Invalid image identifier");
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  const parts = dir.replace(/^\/|\/$/g, "").split("/");
  const bucket = parts.shift();
  if (!bucket) throw new Error("Invalid object storage directory");
  return storage.bucket(bucket).file([...parts, "uploads", "site-images", id].join("/"));
}

export async function requestImageUpload(): Promise<{ uploadURL: string; imageURL: string }> {
  const id = randomUUID();
  const file = fileFor(id);
  const response = await fetch(`${sidecar}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: file.bucket.name,
      object_name: file.name,
      method: "PUT",
      expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Unable to sign upload: ${response.status}`);
  const { signed_url } = await response.json() as { signed_url: string };
  return { uploadURL: signed_url, imageURL: `${prefix}${id}` };
}

export async function verifiedImage(id: string) {
  const file = fileFor(id);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [metadata] = await file.getMetadata();
  if (!IMAGE_TYPES.includes(metadata.contentType as typeof IMAGE_TYPES[number]) ||
    !Number.isFinite(Number(metadata.size)) || Number(metadata.size) < 1 ||
    Number(metadata.size) > MAX_IMAGE_SIZE) return null;
  const chunks: Buffer[] = [];
  for await (const chunk of file.createReadStream({ start: 0, end: 11 })) chunks.push(Buffer.from(chunk));
  const bytes = Buffer.concat(chunks);
  const valid = metadata.contentType === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : metadata.contentType === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : metadata.contentType === "image/webp" ? bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP"
    : bytes.toString("ascii", 0, 6) === "GIF87a" || bytes.toString("ascii", 0, 6) === "GIF89a";
  if (!valid) return null;
  return { file, contentType: metadata.contentType as string };
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
  await fileFor(id).delete({ ignoreNotFound: true });
  return "deleted";
}

export function imageReferences(data: Record<string, unknown>): string[] {
  return [
    ...(typeof data.image === "string" ? [data.image] : []),
    ...(typeof data.value === "string" ? [data.value] : []),
    ...(Array.isArray(data.gallery) ? data.gallery.filter((x): x is string => typeof x === "string") : []),
  ];
}