ALTER TABLE "inventory" DROP CONSTRAINT "inventory_component_id_batch_id_location_id_pk";--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "unique_inventory" UNIQUE NULLS NOT DISTINCT("component_id","batch_id","location_id");