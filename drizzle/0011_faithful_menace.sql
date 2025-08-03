ALTER TABLE "blocks" ALTER COLUMN "exercise_notes" SET DEFAULT undefined;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "exercise_notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "equipment" text;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "session_outcome" text;