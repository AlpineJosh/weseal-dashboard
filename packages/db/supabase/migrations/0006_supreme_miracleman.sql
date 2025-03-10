ALTER TABLE "production_job_allocation_lot" ADD COLUMN "component_lot_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_job_allocation_lot" ADD CONSTRAINT "production_job_allocation_lot_component_lot_id_component_lot_id_fk" FOREIGN KEY ("component_lot_id") REFERENCES "public"."component_lot"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
