ALTER TABLE "programs" ALTER COLUMN "stripe_product_id" SET DEFAULT '-';--> statement-breakpoint
ALTER TABLE "user_programs" ADD COLUMN "stripe_product_id" varchar(255) NOT NULL;