/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'sage'
                AND table_name = 'POP_ITEM'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "POP_ITEM" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "sage"."POP_ITEM" ADD PRIMARY KEY ("ITEMID");--> statement-breakpoint
ALTER TABLE "sage"."POP_ITEM" ALTER COLUMN "ORDER_NUMBER" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sage"."POP_ITEM" ALTER COLUMN "ITEMID" SET NOT NULL;