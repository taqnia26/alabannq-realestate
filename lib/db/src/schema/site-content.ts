import { pgTable, text, jsonb, boolean, timestamp, bigserial, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const contentTable = pgTable("alabnq_content", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  published: boolean("published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertContentSchema = createInsertSchema(contentTable);

export const visitsTable = pgTable("alabnq_visits", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  path: text("path").notNull(),
  session: text("session").notNull(),
  campaign: text("campaign"),
  channel: text("channel"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertVisitSchema = createInsertSchema(visitsTable);

export const inquiriesTable = pgTable("alabnq_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertInquirySchema = createInsertSchema(inquiriesTable);