import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { db, adminUsersTable, pool } from "@workspace/db";

const scrypt = promisify(scryptCallback);

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error("SEED_ADMIN_EMAIL (valid email) and SEED_ADMIN_PASSWORD (at least 12 characters) are required");
  }
  const existing = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).limit(1);
  if (existing.length) throw new Error("An admin already exists; the first-user seed may only run once");
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  await db.insert(adminUsersTable).values({ email, passwordHash: `${salt}:${hash.toString("hex")}` });
  process.stdout.write("First admin created.\n");
}

try { await main(); }
catch (error) {
  process.stderr.write(error instanceof Error ? `${error.message}\n` : "Could not seed admin.\n");
  process.exitCode = 1;
}
finally { await pool.end(); }