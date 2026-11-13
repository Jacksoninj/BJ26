CREATE TABLE `responses` (`id` text PRIMARY KEY NOT NULL, `created_at` text NOT NULL, `nickname` text NOT NULL, `area` text NOT NULL, `hotel` text NOT NULL, `pace` text NOT NULL, `museum` text NOT NULL, `notes` text NOT NULL, `plan` text NOT NULL, `ip_hash` text NOT NULL);
--> statement-breakpoint
CREATE INDEX `responses_created_at_idx` ON `responses` (`created_at`);
--> statement-breakpoint
CREATE INDEX `responses_ip_hash_idx` ON `responses` (`ip_hash`, `created_at`);
