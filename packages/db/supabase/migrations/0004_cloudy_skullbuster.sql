DO $$ BEGIN
 CREATE TYPE "public"."batch_type" AS ENUM('production', 'purchase', 'untracked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "stock_management"."stock_transaction_type" AS ENUM('shipment', 'return', 'transfer', 'production', 'adjustment');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

ALTER TABLE "stock_management"."batch" DROP CONSTRAINT "batch_type_id_batch_type_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_management"."production_job" DROP CONSTRAINT "production_job_status_id_production_job_status_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_management"."stock_transaction" DROP CONSTRAINT "stock_transaction_type_id_stock_transaction_type_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_management"."task" DROP CONSTRAINT "task_task_type_id_task_type_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_management"."task" DROP CONSTRAINT "task_status_id_task_status_id_fk";
--> statement-breakpoint
-- ALTER TABLE "sage"."stock_subcomponent" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "stock_management"."production_job" ALTER COLUMN "batch_number" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "stock_management"."stock_meta" ALTER COLUMN "default_location_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."stock_meta" ALTER COLUMN "requires_quality_check" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "stock_management"."task_item" ALTER COLUMN "pick_location_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."task_item" ALTER COLUMN "put_location_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."batch" ADD COLUMN "type" "batch_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."batch" ADD COLUMN "production_job_id" integer;--> statement-breakpoint
ALTER TABLE "stock_management"."batch" ADD COLUMN "purchase_order_id" integer;--> statement-breakpoint
ALTER TABLE "stock_management"."production_job" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."stock_transaction" ADD COLUMN "type" "stock_management"."stock_transaction_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."task" ADD COLUMN "type" "stock_management"."stock_transaction_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."task" ADD COLUMN "is_cancelled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_management"."task" ADD COLUMN "production_job_id" integer;--> statement-breakpoint
ALTER TABLE "stock_management"."task" ADD COLUMN "purchase_order_id" integer;--> statement-breakpoint
ALTER TABLE "stock_management"."task" ADD COLUMN "sales_order_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."batch" ADD CONSTRAINT "batch_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "stock_management"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."batch" ADD CONSTRAINT "batch_purchase_order_id_purchase_order_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "sage"."purchase_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task" ADD CONSTRAINT "task_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "stock_management"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task" ADD CONSTRAINT "task_purchase_order_id_purchase_order_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "sage"."purchase_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task" ADD CONSTRAINT "task_sales_order_id_sales_order_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "sage"."sales_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "stock_management"."batch" DROP COLUMN IF EXISTS "type_id";--> statement-breakpoint
ALTER TABLE "stock_management"."production_job" DROP COLUMN IF EXISTS "status_id";--> statement-breakpoint
ALTER TABLE "stock_management"."stock_transaction" DROP COLUMN IF EXISTS "type_id";--> statement-breakpoint
ALTER TABLE "stock_management"."task" DROP COLUMN IF EXISTS "task_type_id";--> statement-breakpoint
ALTER TABLE "stock_management"."task" DROP COLUMN IF EXISTS "status_id";