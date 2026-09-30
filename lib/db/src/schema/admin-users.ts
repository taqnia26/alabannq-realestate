import { pgTable, serial, text, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sessionTokenHash: text("session_token_hash").unique(),
  sessionExpiresAt: timestamp("session_expires_at", { withTimezone: true }),
}, table => [
  check("admin_users_email_lowercase", sql`${table.email} = lower(${table.email})`),
]);