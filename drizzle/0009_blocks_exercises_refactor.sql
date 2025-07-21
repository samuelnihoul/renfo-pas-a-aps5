-- Remove rest_time from blocks
ALTER TABLE "blocks" DROP COLUMN IF EXISTS "rest_time";
-- Rename sets to instructions and change type to text
ALTER TABLE "blocks"
    RENAME COLUMN "sets" TO "instructions";
ALTER TABLE "blocks"
ALTER COLUMN "instructions" TYPE text;
-- Add notes to exercises
ALTER TABLE "exercises"
ADD COLUMN IF NOT EXISTS "notes" text;