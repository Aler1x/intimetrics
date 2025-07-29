CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_achievement_id_unique` ON `achievements` (`achievement_id`);