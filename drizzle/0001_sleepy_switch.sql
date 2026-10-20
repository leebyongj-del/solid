CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`group_name` text NOT NULL,
	`token_hash` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `classrooms` ADD `analysis_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `discoveries` ADD `participant_id` text;