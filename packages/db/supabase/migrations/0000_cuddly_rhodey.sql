DO $$ BEGIN
 CREATE TYPE "public"."batch_movement_type" AS ENUM('despatch', 'receipt', 'transfer', 'production', 'correction', 'wastage', 'lost', 'found');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "component" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"has_subcomponents" boolean DEFAULT false NOT NULL,
	"sage_quantity" real NOT NULL,
	"unit" varchar,
	"category_id" smallint,
	"department_id" integer,
	"traceable" boolean DEFAULT false,
	"default_location_id" integer,
	"requires_quality_check" boolean DEFAULT false,
	"quality_check_details" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "component_category" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "department" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subcomponent" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"subcomponent_id" varchar NOT NULL,
	"level" smallint,
	"quantity" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_despatch" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"expected_despatch_date" timestamp,
	"despatch_date" timestamp,
	"is_despatched" boolean DEFAULT false NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_despatch_item" (
	"id" integer PRIMARY KEY NOT NULL,
	"despatch_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"quantity" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_order" (
	"id" integer PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"order_date" timestamp,
	"is_quote" boolean DEFAULT false NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_order_item" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"quantity" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_reference" varchar,
	"entry_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_movement" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"batch_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"quantity" real NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "batch_movement_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_movement_correction" (
	"id" serial PRIMARY KEY NOT NULL,
	"correction_movement_id" integer NOT NULL,
	"corrected_movement_id" integer NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"details" varchar,
	"group_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"details" varchar,
	"parent_group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"is_pickable" boolean DEFAULT true NOT NULL,
	"is_transient" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "batch_movement_type" NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"assigned_to_user_id" varchar NOT NULL,
	"created_by_user_id" varchar NOT NULL,
	"production_job_item_id" integer,
	"purchase_receipt_item_id" integer,
	"sales_despatch_item_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"pick_location_id" integer,
	"put_location_id" integer,
	"quantity" real NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_batch_in" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"quantity_allocated" real DEFAULT 0 NOT NULL,
	"location_id" integer NOT NULL,
	"quantity_used" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_job" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_number" varchar,
	"target_quantity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_job_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order" (
	"id" integer PRIMARY KEY NOT NULL,
	"supplier_id" varchar NOT NULL,
	"is_quote" boolean DEFAULT false NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"order_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order_item" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"quantity_ordered" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_receipt" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"expected_receipt_date" timestamp,
	"receipt_date" timestamp,
	"is_received" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_receipt_item" (
	"id" integer PRIMARY KEY NOT NULL,
	"receipt_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"quantity" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component" ADD CONSTRAINT "component_category_id_component_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."component_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component" ADD CONSTRAINT "component_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component" ADD CONSTRAINT "component_default_location_id_location_id_fk" FOREIGN KEY ("default_location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subcomponent" ADD CONSTRAINT "subcomponent_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subcomponent" ADD CONSTRAINT "subcomponent_subcomponent_id_component_id_fk" FOREIGN KEY ("subcomponent_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_despatch" ADD CONSTRAINT "sales_despatch_order_id_sales_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_despatch_item" ADD CONSTRAINT "sales_despatch_item_despatch_id_sales_despatch_id_fk" FOREIGN KEY ("despatch_id") REFERENCES "public"."sales_despatch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_despatch_item" ADD CONSTRAINT "sales_despatch_item_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_order_item" ADD CONSTRAINT "sales_order_item_order_id_sales_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_order_item" ADD CONSTRAINT "sales_order_item_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch" ADD CONSTRAINT "batch_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_movement" ADD CONSTRAINT "batch_movement_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_movement" ADD CONSTRAINT "batch_movement_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "location" ADD CONSTRAINT "location_group_id_location_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."location_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "location" ADD CONSTRAINT "location_type_id_location_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."location_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "location_group" ADD CONSTRAINT "location_group_parent_group_id_location_group_id_fk" FOREIGN KEY ("parent_group_id") REFERENCES "public"."location_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_production_job_item_id_production_batch_in_id_fk" FOREIGN KEY ("production_job_item_id") REFERENCES "public"."production_batch_in"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_purchase_receipt_item_id_purchase_receipt_item_id_fk" FOREIGN KEY ("purchase_receipt_item_id") REFERENCES "public"."purchase_receipt_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_sales_despatch_item_id_sales_despatch_item_id_fk" FOREIGN KEY ("sales_despatch_item_id") REFERENCES "public"."sales_despatch_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_item" ADD CONSTRAINT "task_item_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_item" ADD CONSTRAINT "task_item_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_item" ADD CONSTRAINT "task_item_pick_location_id_location_id_fk" FOREIGN KEY ("pick_location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_item" ADD CONSTRAINT "task_item_put_location_id_location_id_fk" FOREIGN KEY ("put_location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_batch_in" ADD CONSTRAINT "production_batch_in_job_id_production_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_batch_in" ADD CONSTRAINT "production_batch_in_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_batch_in" ADD CONSTRAINT "production_batch_in_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job" ADD CONSTRAINT "production_job_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_order_id_purchase_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."purchase_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_receipt" ADD CONSTRAINT "purchase_receipt_order_id_purchase_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."purchase_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_receipt_item" ADD CONSTRAINT "purchase_receipt_item_receipt_id_purchase_receipt_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."purchase_receipt"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_receipt_item" ADD CONSTRAINT "purchase_receipt_item_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
