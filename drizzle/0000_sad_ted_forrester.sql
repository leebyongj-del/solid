CREATE TABLE `classrooms` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`teacher_hash` text NOT NULL,
	`phase` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discoveries` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`group_name` text NOT NULL,
	`title` text NOT NULL,
	`guess` text NOT NULL,
	`reason` text NOT NULL,
	`model` text NOT NULL,
	`reflection` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '탐구 중' NOT NULL,
	`edit_hash` text NOT NULL,
	`photo_key` text NOT NULL,
	`created` text NOT NULL
);
