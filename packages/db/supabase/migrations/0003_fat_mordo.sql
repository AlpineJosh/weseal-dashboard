DO $$ BEGIN
 CREATE TYPE "public"."job_status" AS ENUM('active', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- ALTER TABLE "sage"."sync_job" ALTER COLUMN "status" SET DATA TYPE job_status;--> statement-breakpoint
-- ALTER TABLE "sage"."sync_job" ALTER COLUMN "status" SET DEFAULT 'active';