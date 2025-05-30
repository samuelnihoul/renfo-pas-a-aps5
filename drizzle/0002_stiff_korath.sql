ALTER TABLE "blocks" RENAME COLUMN "routines_id" TO "exerciceId";--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "day_exercise_unique_idx";--> statement-breakpoint
ALTER TABLE "routines" DROP CONSTRAINT "routines_program_id_day_number_unique";--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "blocks_routines_id_routines_id_fk";
--> statement-breakpoint
ALTER TABLE "routines" DROP CONSTRAINT "routines_program_id_programs_id_fk";
--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "exerciceId" SET DATA TYPE integer[];--> statement-breakpoint
ALTER TABLE "routines" ALTER COLUMN "program_id" SET DATA TYPE integer[];--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "focus" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "routine_id" integer[];--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "order_index" integer[];--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "material" text NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "orderId" integer[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_exerciceId_exercises_id_fk" FOREIGN KEY ("exerciceId") REFERENCES "exercises"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "programs" ADD CONSTRAINT "programs_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "routines" ADD CONSTRAINT "routines_program_id_blocks_id_fk" FOREIGN KEY ("program_id") REFERENCES "blocks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN IF EXISTS "reps";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "day_number";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "focus";