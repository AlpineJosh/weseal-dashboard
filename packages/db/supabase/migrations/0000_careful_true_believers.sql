CREATE SCHEMA "sage";
--> statement-breakpoint
CREATE SCHEMA "stock_management";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."department" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"modify_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."purchase_account" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."purchase_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" varchar NOT NULL,
	"order_or_quote" varchar,
	"order_date" timestamp,
	"delivery_date" timestamp,
	"order_status_code" smallint,
	"order_status" varchar,
	"delivery_status_code" smallint,
	"delivery_status" varchar,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."purchase_order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"delivery_date" timestamp,
	"description" varchar,
	"due_date" timestamp,
	"quantity_allocated" numeric,
	"quantity_delivered" numeric,
	"quantity_despatch" numeric,
	"quantity_order" numeric,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."sales_account" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."sales_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" varchar NOT NULL,
	"despatch_date" timestamp,
	"despatch_status" varchar,
	"despatch_status_code" smallint,
	"order_date" timestamp,
	"order_or_quote" varchar,
	"order_type_code" smallint,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."sales_order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"delivery_date" timestamp,
	"due_date" timestamp,
	"quantity_allocated" numeric,
	"quantity_delivered" numeric,
	"quantity_despatch" numeric,
	"quantity_order" numeric,
	"modify_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."stock_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."stock_component" (
	"id" varchar PRIMARY KEY NOT NULL,
	"stock_category_id" smallint,
	"description" varchar,
	"has_subcomponents" boolean DEFAULT false NOT NULL,
	"quantity_allocated" numeric NOT NULL,
	"quantity_in_stock" numeric NOT NULL,
	"quantity_on_order" numeric NOT NULL,
	"unit_of_sale" varchar,
	"department_id" integer,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."stock_subcomponent" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"subcomponent_id" varchar NOT NULL,
	"level" smallint,
	"quantity" numeric NOT NULL,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sage"."stock_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_id" varchar NOT NULL,
	"transaction_type" varchar NOT NULL,
	"quantity" numeric NOT NULL,
	"date" timestamp NOT NULL,
	"modify_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_number" varchar,
	"date" date NOT NULL,
	"type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."batch_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"details" varchar,
	"group_id" integer NOT NULL,
	"type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."location_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"details" varchar,
	"parent_group_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."location_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"is_pickable" boolean DEFAULT true NOT NULL,
	"is_transient" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."production_job" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_number" integer,
	"target_quantity" integer DEFAULT 0 NOT NULL,
	"status_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."production_job_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"quantity_allocated" numeric DEFAULT '0.0' NOT NULL,
	"location_id" integer NOT NULL,
	"quantity_used" numeric DEFAULT '0.0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."production_job_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."stock_meta" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"is_traceable" boolean,
	"default_location_id" integer NOT NULL,
	"requires_quality_check" boolean,
	"quality_check_details" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."stock_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"batch_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"quantity" numeric NOT NULL,
	"user_id" varchar NOT NULL,
	"type_id" integer NOT NULL,
	"production_job_id" integer,
	"task_id" integer,
	"sales_order" integer,
	"purchase_order" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."stock_transaction_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."task" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_type_id" integer NOT NULL,
	"status_id" integer NOT NULL,
	"assigned_to_user_id" varchar NOT NULL,
	"created_by_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."task_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"pick_location_id" integer NOT NULL,
	"put_location_id" integer NOT NULL,
	"quantity" numeric NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."task_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_management"."task_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."purchase_order" ADD CONSTRAINT "purchase_order_account_id_purchase_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "sage"."purchase_account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."purchase_order_item" ADD CONSTRAINT "purchase_order_item_order_id_purchase_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "sage"."purchase_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."purchase_order_item" ADD CONSTRAINT "purchase_order_item_component_id_stock_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."sales_order" ADD CONSTRAINT "sales_order_account_id_sales_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "sage"."sales_account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."sales_order_item" ADD CONSTRAINT "sales_order_item_order_id_sales_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "sage"."sales_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."sales_order_item" ADD CONSTRAINT "sales_order_item_component_id_stock_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."stock_component" ADD CONSTRAINT "stock_component_stock_category_id_stock_category_id_fk" FOREIGN KEY ("stock_category_id") REFERENCES "sage"."stock_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."stock_component" ADD CONSTRAINT "stock_component_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "sage"."department"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."stock_subcomponent" ADD CONSTRAINT "stock_subcomponent_component_id_stock_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."stock_subcomponent" ADD CONSTRAINT "stock_subcomponent_subcomponent_id_stock_component_id_fk" FOREIGN KEY ("subcomponent_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sage"."stock_transaction" ADD CONSTRAINT "stock_transaction_stock_id_stock_component_id_fk" FOREIGN KEY ("stock_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."batch" ADD CONSTRAINT "batch_component_id_stock_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."batch" ADD CONSTRAINT "batch_type_id_batch_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "stock_management"."batch_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."location" ADD CONSTRAINT "location_group_id_location_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "stock_management"."location_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."location" ADD CONSTRAINT "location_type_id_location_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "stock_management"."location_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."location_group" ADD CONSTRAINT "location_group_parent_group_id_location_group_id_fk" FOREIGN KEY ("parent_group_id") REFERENCES "stock_management"."location_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."production_job" ADD CONSTRAINT "production_job_component_id_stock_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."production_job" ADD CONSTRAINT "production_job_status_id_production_job_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "stock_management"."production_job_status"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."production_job_item" ADD CONSTRAINT "production_job_item_job_id_production_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "stock_management"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."production_job_item" ADD CONSTRAINT "production_job_item_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "stock_management"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."production_job_item" ADD CONSTRAINT "production_job_item_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "stock_management"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_meta" ADD CONSTRAINT "stock_meta_component_id_stock_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "sage"."stock_component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_meta" ADD CONSTRAINT "stock_meta_default_location_id_location_id_fk" FOREIGN KEY ("default_location_id") REFERENCES "stock_management"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "stock_management"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "stock_management"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_type_id_stock_transaction_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "stock_management"."stock_transaction_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "stock_management"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "stock_management"."task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_sales_order_sales_order_id_fk" FOREIGN KEY ("sales_order") REFERENCES "sage"."sales_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."stock_transaction" ADD CONSTRAINT "stock_transaction_purchase_order_purchase_order_id_fk" FOREIGN KEY ("purchase_order") REFERENCES "sage"."purchase_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task" ADD CONSTRAINT "task_task_type_id_task_type_id_fk" FOREIGN KEY ("task_type_id") REFERENCES "stock_management"."task_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task" ADD CONSTRAINT "task_status_id_task_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "stock_management"."task_status"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task_item" ADD CONSTRAINT "task_item_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "stock_management"."task"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task_item" ADD CONSTRAINT "task_item_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "stock_management"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task_item" ADD CONSTRAINT "task_item_pick_location_id_location_id_fk" FOREIGN KEY ("pick_location_id") REFERENCES "stock_management"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_management"."task_item" ADD CONSTRAINT "task_item_put_location_id_location_id_fk" FOREIGN KEY ("put_location_id") REFERENCES "stock_management"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
