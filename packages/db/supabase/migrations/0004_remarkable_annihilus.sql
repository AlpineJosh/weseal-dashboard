CREATE TABLE IF NOT EXISTS "production_job_allocation_lot" (
	"id" serial PRIMARY KEY NOT NULL,
	"production_job_allocation_id" integer NOT NULL,
	"quantity" numeric(15,6) DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_allocation_lot" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_allocation_id" integer NOT NULL,
	"quantity" numeric(15,6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "batch_movement";--> statement-breakpoint
DROP TABLE "batch_movement_correction";--> statement-breakpoint
ALTER TABLE "production_job_input" RENAME TO "production_job_allocation";--> statement-breakpoint
ALTER TABLE "task_item" RENAME TO "task_allocation";--> statement-breakpoint
ALTER TABLE "inventory_ledger" RENAME COLUMN "production_job_input_id" TO "production_job_allocation_id";--> statement-breakpoint
ALTER TABLE "inventory_lot_ledger" RENAME COLUMN "production_job_input_id" TO "production_job_allocation_id";--> statement-breakpoint
ALTER TABLE "production_job_allocation" RENAME COLUMN "quantity_allocated" TO "remaining_quantity";--> statement-breakpoint
ALTER TABLE "production_job_allocation" RENAME COLUMN "quantity_used" TO "used_quantity";--> statement-breakpoint
ALTER TABLE "inventory_ledger" DROP CONSTRAINT "inventory_ledger_production_job_input_id_production_job_input_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_lot_ledger" DROP CONSTRAINT "inventory_lot_ledger_production_job_input_id_production_job_input_id_fk";
--> statement-breakpoint
ALTER TABLE "production_job_allocation" DROP CONSTRAINT "production_job_input_production_job_id_production_job_id_fk";
--> statement-breakpoint
ALTER TABLE "production_job_allocation" DROP CONSTRAINT "production_job_input_component_id_component_id_fk";
--> statement-breakpoint
ALTER TABLE "production_job_allocation" DROP CONSTRAINT "production_job_input_batch_id_batch_id_fk";
--> statement-breakpoint
ALTER TABLE "production_job_allocation" DROP CONSTRAINT "production_job_input_location_id_location_id_fk";
--> statement-breakpoint
ALTER TABLE "task_allocation" DROP CONSTRAINT "task_item_task_id_task_id_fk";
--> statement-breakpoint
ALTER TABLE "task_allocation" DROP CONSTRAINT "task_item_component_id_component_id_fk";
--> statement-breakpoint
ALTER TABLE "task_allocation" DROP CONSTRAINT "task_item_batch_id_batch_id_fk";
--> statement-breakpoint
ALTER TABLE "task_allocation" DROP CONSTRAINT "task_item_pick_location_id_location_id_fk";
--> statement-breakpoint
ALTER TABLE "task_allocation" DROP CONSTRAINT "task_item_put_location_id_location_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order" ALTER COLUMN "order_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order_item" ALTER COLUMN "quantity_ordered" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order_item" ALTER COLUMN "sage_quantity_received" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "production_job_allocation" ADD COLUMN "total_quantity" numeric(15,6) DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_allocation_lot" ADD CONSTRAINT "production_job_allocation_lot_production_job_allocation_id_production_job_allocation_id_fk" FOREIGN KEY ("production_job_allocation_id") REFERENCES "public"."production_job_allocation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation_lot" ADD CONSTRAINT "task_allocation_lot_task_allocation_id_task_allocation_id_fk" FOREIGN KEY ("task_allocation_id") REFERENCES "public"."task_allocation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_production_job_allocation_id_production_job_allocation_id_fk" FOREIGN KEY ("production_job_allocation_id") REFERENCES "public"."production_job_allocation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot_ledger" ADD CONSTRAINT "inventory_lot_ledger_production_job_allocation_id_production_job_allocation_id_fk" FOREIGN KEY ("production_job_allocation_id") REFERENCES "public"."production_job_allocation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_allocation" ADD CONSTRAINT "production_job_allocation_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "public"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_allocation" ADD CONSTRAINT "production_job_allocation_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_allocation" ADD CONSTRAINT "production_job_allocation_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_allocation" ADD CONSTRAINT "production_job_allocation_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation" ADD CONSTRAINT "task_allocation_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation" ADD CONSTRAINT "task_allocation_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation" ADD CONSTRAINT "task_allocation_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation" ADD CONSTRAINT "task_allocation_pick_location_id_location_id_fk" FOREIGN KEY ("pick_location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation" ADD CONSTRAINT "task_allocation_put_location_id_location_id_fk" FOREIGN KEY ("put_location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "inventory_ledger" DROP COLUMN IF EXISTS "is_allocated";--> statement-breakpoint
ALTER TABLE "inventory_lot_ledger" DROP COLUMN IF EXISTS "is_allocated";