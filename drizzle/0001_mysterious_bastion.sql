ALTER TABLE "exercises" DROP CONSTRAINT "exercises_block_id_blocks_id_fk";
--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN IF EXISTS "video_public_id";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN IF EXISTS "block_id";