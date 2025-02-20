ALTER TABLE "production_job" ALTER COLUMN "target_quantity" SET DATA TYPE NUMERIC(15,6);--> statement-breakpoint
ALTER TABLE "production_job" ALTER COLUMN "target_quantity" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "production_job" ALTER COLUMN "quantity_produced" SET DATA TYPE NUMERIC(15,6);--> statement-breakpoint
ALTER TABLE "production_job" ALTER COLUMN "quantity_produced" SET DEFAULT 0;