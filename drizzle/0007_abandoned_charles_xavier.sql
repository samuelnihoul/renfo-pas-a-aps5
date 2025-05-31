ALTER TABLE "blocks" ALTER COLUMN "sets" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "name" varchar NOT NULL;