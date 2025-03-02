import { doublePrecision, pgTable, serial, text } from "drizzle-orm/pg-core";

export const parameters = pgTable("parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  display_name: text("display_name").notNull(),
  description: text("description"),
  unit: text("unit").notNull(),
  min_safe_value: doublePrecision("min_safe_value"),
  max_safe_value: doublePrecision("max_safe_value"),
});

export type Parameter = typeof parameters.$inferSelect;
export type NewParameter = typeof parameters.$inferInsert;
