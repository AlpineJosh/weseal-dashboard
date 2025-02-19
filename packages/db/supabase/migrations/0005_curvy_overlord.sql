ALTER TABLE "purchase_receipt_item" ALTER COLUMN "quantity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_allocation" ALTER COLUMN "pick_location_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_allocation_lot" ADD COLUMN "component_lot_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_allocation_lot" ADD CONSTRAINT "task_allocation_lot_component_lot_id_component_lot_id_fk" FOREIGN KEY ("component_lot_id") REFERENCES "public"."component_lot"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
