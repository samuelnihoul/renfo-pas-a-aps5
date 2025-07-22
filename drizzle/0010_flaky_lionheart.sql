CREATE TABLE IF NOT EXISTS "accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" varchar(255),
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" varchar(255),
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"sessionToken" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"program_id" integer NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_unique" UNIQUE("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "blocks" RENAME COLUMN "sets" TO "instructions";--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "day_exercise_unique_idx";--> statement-breakpoint
ALTER TABLE "routines" DROP CONSTRAINT "routines_program_id_day_number_unique";--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "blocks_routines_id_routines_id_fk";
--> statement-breakpoint
ALTER TABLE "routines" DROP CONSTRAINT "routines_program_id_programs_id_fk";
--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "instructions" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "isPremium" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "exerciceId" integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "exercise_notes" text[] DEFAULT  NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "focus" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "objectifs" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "routine_id" integer[];--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "material" text NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "block_id" integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isAdmin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN IF EXISTS "routines_id";--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN IF EXISTS "reps";--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN IF EXISTS "rest_time";--> statement-breakpoint
ALTER TABLE "blocks" DROP COLUMN IF EXISTS "order_index";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN IF EXISTS "tempsReps";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "program_id";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "day_number";--> statement-breakpoint
ALTER TABLE "routines" DROP COLUMN IF EXISTS "focus";