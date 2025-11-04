ALTER TABLE "exercises" RENAME COLUMN "video_url" TO "video_public_id";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "thumbnail_url" varchar(512);--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "muscle_group" varchar(100);