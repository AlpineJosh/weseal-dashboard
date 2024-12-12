ALTER TABLE "component" ALTER COLUMN "sage_quantity" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "subcomponent" ALTER COLUMN "quantity" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "sales_despatch_item" ALTER COLUMN "quantity" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "sales_order_item" ALTER COLUMN "quantity_ordered" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "sales_order_item" ALTER COLUMN "sage_quantity_despatched" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "batch_movement" ALTER COLUMN "quantity" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "task_item" ALTER COLUMN "quantity" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "production_batch_input" ALTER COLUMN "quantity_allocated" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "purchase_order_item" ALTER COLUMN "quantity_ordered" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "purchase_order_item" ALTER COLUMN "sage_quantity_received" SET DATA TYPE decimal(15,6);--> statement-breakpoint
ALTER TABLE "purchase_receipt_item" ALTER COLUMN "quantity" SET DATA TYPE decimal(15,6);