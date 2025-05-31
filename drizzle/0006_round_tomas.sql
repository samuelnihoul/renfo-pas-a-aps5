ALTER TABLE "blocks" ALTER COLUMN "order_index" SET DATA TYPE integer[];--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "order_index" DROP NOT NULL;