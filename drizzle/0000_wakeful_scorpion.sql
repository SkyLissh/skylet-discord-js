CREATE TABLE `guilds` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `streamers` (
	`channel` text PRIMARY KEY NOT NULL,
	`is_live` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `twitch_alerts` (
	`guild_id` text NOT NULL,
	`streamer_channel` text NOT NULL,
	`message` text,
	`alerts_channel` text NOT NULL,
	PRIMARY KEY(`guild_id`, `streamer_channel`),
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streamer_channel`) REFERENCES `streamers`(`channel`) ON UPDATE no action ON DELETE no action
);
