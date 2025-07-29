import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { ACTIVITY_TYPES, RELATIONSHIP_TYPES } from '~/lib/constants';

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ACTIVITY_TYPES }).notNull(),
  date: text('date').notNull(),
  description: text('description'),
  partner: text('partner'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const partners = sqliteTable('partners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  relationshipType: text('relationship_type', { enum: RELATIONSHIP_TYPES }),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  achievementId: text('achievement_id').notNull().unique(),
  unlockedAt: text('unlocked_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
