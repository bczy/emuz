CREATE TABLE `collection_games` (
	`collection_id` text NOT NULL,
	`game_id` text NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`collection_id`, `game_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover_path` text,
	`is_system` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `emulators` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`executable_path` text,
	`package_name` text,
	`url_scheme` text,
	`icon_path` text,
	`command_template` text,
	`core_path` text,
	`is_default` integer DEFAULT false NOT NULL,
	`is_installed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`platform_id` text NOT NULL,
	`title` text NOT NULL,
	`file_path` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer,
	`file_hash` text,
	`cover_path` text,
	`description` text,
	`developer` text,
	`publisher` text,
	`release_date` text,
	`genre` text,
	`rating` real,
	`play_count` integer DEFAULT 0 NOT NULL,
	`play_time` integer DEFAULT 0 NOT NULL,
	`last_played_at` integer,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon_name` text,
	`color` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genres_slug_unique` ON `genres` (`slug`);--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`manufacturer` text,
	`generation` integer,
	`release_year` integer,
	`icon_path` text,
	`wallpaper_path` text,
	`color` text,
	`rom_extensions` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scan_directories` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`platform_id` text,
	`is_recursive` integer DEFAULT true NOT NULL,
	`last_scanned_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scan_directories_path_unique` ON `scan_directories` (`path`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text,
	`size` text DEFAULT 'medium' NOT NULL,
	`position` integer NOT NULL,
	`config` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
