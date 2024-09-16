ALTER TABLE "bit_systems"."bin" ADD PRIMARY KEY ("pk_Bin_ID");--> statement-breakpoint
ALTER TABLE "bit_systems"."bin" ALTER COLUMN "pk_Bin_ID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bit_systems"."bin_item" ADD PRIMARY KEY ("pk_BinItem_ID");--> statement-breakpoint
ALTER TABLE "bit_systems"."bin_item" ALTER COLUMN "pk_BinItem_ID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bit_systems"."stock_item" ADD PRIMARY KEY ("pk_StockItem_ID");--> statement-breakpoint
ALTER TABLE "bit_systems"."stock_item" ALTER COLUMN "pk_StockItem_ID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bit_systems"."traceable_bin_item" ADD PRIMARY KEY ("pk_TraceableBinItem_ID");--> statement-breakpoint
ALTER TABLE "bit_systems"."traceable_bin_item" ALTER COLUMN "pk_TraceableBinItem_ID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bit_systems"."traceable_item" ADD PRIMARY KEY ("pk_TraceableItem_ID");--> statement-breakpoint
ALTER TABLE "bit_systems"."traceable_item" ALTER COLUMN "pk_TraceableItem_ID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bit_systems"."warehouse" ADD PRIMARY KEY ("pk_Warehouse_ID");--> statement-breakpoint
ALTER TABLE "bit_systems"."warehouse" ALTER COLUMN "pk_Warehouse_ID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."DEPARTMENT" ADD PRIMARY KEY ("NUMBER");--> statement-breakpoint
ALTER TABLE "sage"."DEPARTMENT" ALTER COLUMN "NUMBER" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."POP_ITEM" ADD PRIMARY KEY ("ITEMID");--> statement-breakpoint
ALTER TABLE "sage"."POP_ITEM" ALTER COLUMN "ITEMID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."PURCHASE_LEDGER" ADD PRIMARY KEY ("ACCOUNT_REF");--> statement-breakpoint
ALTER TABLE "sage"."PURCHASE_LEDGER" ALTER COLUMN "ACCOUNT_REF" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."PURCHASE_ORDER" ADD PRIMARY KEY ("ORDER_NUMBER");--> statement-breakpoint
ALTER TABLE "sage"."PURCHASE_ORDER" ALTER COLUMN "ORDER_NUMBER" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."SALES_LEDGER" ADD PRIMARY KEY ("ACCOUNT_REF");--> statement-breakpoint
ALTER TABLE "sage"."SALES_LEDGER" ALTER COLUMN "ACCOUNT_REF" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."SALES_ORDER" ADD PRIMARY KEY ("ORDER_NUMBER");--> statement-breakpoint
ALTER TABLE "sage"."SALES_ORDER" ALTER COLUMN "ORDER_NUMBER" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."SOP_ITEM" ADD PRIMARY KEY ("ITEMID");--> statement-breakpoint
ALTER TABLE "sage"."SOP_ITEM" ALTER COLUMN "ITEMID" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."STOCK" ADD PRIMARY KEY ("STOCK_CODE");--> statement-breakpoint
ALTER TABLE "sage"."STOCK" ALTER COLUMN "STOCK_CODE" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."STOCK_CAT" ADD PRIMARY KEY ("NUMBER");--> statement-breakpoint
ALTER TABLE "sage"."STOCK_CAT" ALTER COLUMN "NUMBER" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."STOCK_TRAN" ADD PRIMARY KEY ("TRAN_NUMBER");--> statement-breakpoint
ALTER TABLE "sage"."STOCK_TRAN" ALTER COLUMN "TRAN_NUMBER" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."GDN_ITEM" ADD CONSTRAINT "GDN_ITEM_GDN_NUMBER_ITEM_NUMBER_pk" PRIMARY KEY("GDN_NUMBER","ITEM_NUMBER");--> statement-breakpoint
ALTER TABLE "sage"."GRN_ITEM" ADD CONSTRAINT "GRN_ITEM_GRN_NUMBER_ITEM_NUMBER_pk" PRIMARY KEY("GRN_NUMBER","ITEM_NUMBER");