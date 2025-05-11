CREATE TABLE IF NOT EXISTS "day_exercises" (
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
CREATE TABLE IF NOT EXISTS "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"muscle_group" varchar(100) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"video_url" varchar(255),
	"video_public_id" varchar(255),
	"instructions" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "favorites_user_id_exercise_id_unique" UNIQUE("user_id","exercise_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "program_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"focus" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "program_days_program_id_day_number_unique" UNIQUE("program_id","day_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"difficulty" varchar(50) NOT NULL,
	"duration" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"program_day_id" integer,
	"date" date DEFAULT now() NOT NULL,
	"sets_completed" integer NOT NULL,
	"reps_completed" varchar(255) NOT NULL,
	"weight" numeric(6, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "day_exercises" ADD CONSTRAINT "day_exercises_day_id_program_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "program_days"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "day_exercises" ADD CONSTRAINT "day_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program_days" ADD CONSTRAINT "program_days_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_program_day_id_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "program_days"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
