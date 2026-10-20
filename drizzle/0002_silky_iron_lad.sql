CREATE TABLE `teacher_login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`started` integer NOT NULL
);
