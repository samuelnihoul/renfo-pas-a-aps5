CREATE TABLE IF NOT EXISTS "block" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sets" integer NOT NULL,
	"reps" varchar(50) NOT NULL,
	"rest_time" varchar(50),
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "day_exercise_unique_idx" UNIQUE("day_id","exercise_id","order_index")
);
--> statement-breakpoint
DROP TABLE "day_exercises";--> statement-breakpoint
DROP TABLE "program_days";--> statement-breakpoint
ALTER TABLE "programs" RENAME TO "routines";--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_program_day_id_program_days_id_fk";
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "tempsReps" varchar;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "program_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "day_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "focus" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_program_day_id_routines_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "routines"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN IF EXISTS "muscle_group";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN IF EXISTS "difficulty";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "difficulty";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "block" ADD CONSTRAINT "block_day_id_routines_id_fk" FOREIGN KEY ("day_id") REFERENCES "routines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "block" ADD CONSTRAINT "block_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_program_id_day_number_unique" UNIQUE("program_id","day_number");