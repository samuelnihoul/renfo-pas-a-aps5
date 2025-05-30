ALTER TABLE "blocks" DROP CONSTRAINT "blocks_exerciceId_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "routines" DROP CONSTRAINT "routines_program_id_blocks_id_fk";