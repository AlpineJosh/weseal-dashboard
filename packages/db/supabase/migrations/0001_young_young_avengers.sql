DO $$ BEGIN
 CREATE TYPE "public"."transaction_type" AS ENUM('despatch', 'receipt', 'transfer', 'production', 'correction', 'wastage', 'lost', 'found');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_reference" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "component" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"has_subcomponents" boolean DEFAULT false NOT NULL,
	"sage_quantity" numeric(15,6) NOT NULL,
	"unit" varchar,
	"category_id" smallint,
	"department_id" integer,
	"stock_tracked" boolean DEFAULT true,
	"batch_tracked" boolean DEFAULT false,
	"default_location_id" integer,
	"requires_quality_check" boolean DEFAULT false,
	"quality_check_details" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "component_category" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "department" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subcomponent" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"subcomponent_id" varchar NOT NULL,
	"level" smallint,
	"quantity" numeric(15,6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_despatch" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"despatch_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"quantity" numeric(15,6) NOT NULL,
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
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_order_item" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"quantity_ordered" numeric(15,6) NOT NULL,
	"sage_quantity_despatched" numeric(15,6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_movement" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"batch_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"quantity" numeric(15,6) NOT NULL,
	"user_id" uuid,
	"type" "transaction_type" NOT NULL,
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
CREATE TABLE IF NOT EXISTS "component_lot" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"entry_date" date NOT NULL,
	"purchase_receipt_item_id" integer,
	"production_job_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"location_id" integer NOT NULL,
	"entry_date" date NOT NULL,
	"total_quantity" numeric(15,6) NOT NULL,
	"allocated_quantity" numeric(15,6) NOT NULL,
	"free_quantity" numeric(15,6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_component_id_batch_id_location_id_pk" PRIMARY KEY("component_id","batch_id","location_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"location_id" integer NOT NULL,
	"quantity" numeric(15,6) NOT NULL,
	"user_id" uuid,
	"type" "transaction_type" NOT NULL,
	"is_allocated" boolean DEFAULT false NOT NULL,
	"sales_despatch_item_id" integer,
	"production_job_input_id" integer,
	"purchase_receipt_item_id" integer,
	"production_job_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_lot" (
	"component_lot_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"total_quantity" numeric(15,6) NOT NULL,
	"allocated_quantity" numeric(15,6) NOT NULL,
	"free_quantity" numeric(15,6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_lot_component_lot_id_location_id_pk" PRIMARY KEY("component_lot_id","location_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_lot_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_lot_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"quantity" numeric(15,6) NOT NULL,
	"user_id" uuid,
	"type" "transaction_type" NOT NULL,
	"is_allocated" boolean DEFAULT false NOT NULL,
	"sales_despatch_item_id" integer,
	"production_job_input_id" integer,
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
CREATE TABLE IF NOT EXISTS "production_job" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"output_location_id" integer NOT NULL,
	"target_quantity" integer DEFAULT 0 NOT NULL,
	"quantity_produced" integer DEFAULT 0 NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_job_input" (
	"id" serial PRIMARY KEY NOT NULL,
	"production_job_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"location_id" integer NOT NULL,
	"quantity_allocated" numeric(15,6) DEFAULT 0 NOT NULL,
	"quantity_used" numeric(15,6) DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255)
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
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order_item" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"quantity_ordered" numeric(15,6),
	"sage_quantity_received" numeric(15,6),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_receipt" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"receipt_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_receipt_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"receipt_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"quantity" numeric(15,6),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "transaction_type" NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"assigned_to_user_id" uuid,
	"created_by_user_id" uuid,
	"production_job_id" integer,
	"sales_despatch_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"component_id" varchar NOT NULL,
	"batch_id" integer,
	"pick_location_id" integer,
	"put_location_id" integer,
	"quantity" numeric(15,6) NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch" ADD CONSTRAINT "batch_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
 ALTER TABLE "sales_despatch_item" ADD CONSTRAINT "sales_despatch_item_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "batch_movement" ADD CONSTRAINT "batch_movement_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component_lot" ADD CONSTRAINT "component_lot_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component_lot" ADD CONSTRAINT "component_lot_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component_lot" ADD CONSTRAINT "component_lot_purchase_receipt_item_id_purchase_receipt_item_id_fk" FOREIGN KEY ("purchase_receipt_item_id") REFERENCES "public"."purchase_receipt_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "component_lot" ADD CONSTRAINT "component_lot_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "public"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_sales_despatch_item_id_sales_despatch_item_id_fk" FOREIGN KEY ("sales_despatch_item_id") REFERENCES "public"."sales_despatch_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_production_job_input_id_production_job_input_id_fk" FOREIGN KEY ("production_job_input_id") REFERENCES "public"."production_job_input"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_purchase_receipt_item_id_purchase_receipt_item_id_fk" FOREIGN KEY ("purchase_receipt_item_id") REFERENCES "public"."purchase_receipt_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "public"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot" ADD CONSTRAINT "inventory_lot_component_lot_id_component_lot_id_fk" FOREIGN KEY ("component_lot_id") REFERENCES "public"."component_lot"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot" ADD CONSTRAINT "inventory_lot_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot_ledger" ADD CONSTRAINT "inventory_lot_ledger_component_lot_id_component_lot_id_fk" FOREIGN KEY ("component_lot_id") REFERENCES "public"."component_lot"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot_ledger" ADD CONSTRAINT "inventory_lot_ledger_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot_ledger" ADD CONSTRAINT "inventory_lot_ledger_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot_ledger" ADD CONSTRAINT "inventory_lot_ledger_sales_despatch_item_id_sales_despatch_item_id_fk" FOREIGN KEY ("sales_despatch_item_id") REFERENCES "public"."sales_despatch_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_lot_ledger" ADD CONSTRAINT "inventory_lot_ledger_production_job_input_id_production_job_input_id_fk" FOREIGN KEY ("production_job_input_id") REFERENCES "public"."production_job_input"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "production_job" ADD CONSTRAINT "production_job_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job" ADD CONSTRAINT "production_job_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job" ADD CONSTRAINT "production_job_output_location_id_location_id_fk" FOREIGN KEY ("output_location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_input" ADD CONSTRAINT "production_job_input_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "public"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_input" ADD CONSTRAINT "production_job_input_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_input" ADD CONSTRAINT "production_job_input_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_input" ADD CONSTRAINT "production_job_input_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile" ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "purchase_receipt_item" ADD CONSTRAINT "purchase_receipt_item_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_assigned_to_user_id_profile_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_created_by_user_id_profile_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_production_job_id_production_job_id_fk" FOREIGN KEY ("production_job_id") REFERENCES "public"."production_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_sales_despatch_id_sales_despatch_id_fk" FOREIGN KEY ("sales_despatch_id") REFERENCES "public"."sales_despatch"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "task_item" ADD CONSTRAINT "task_item_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;
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
