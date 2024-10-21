ALTER TABLE
  "batch_movement"
ALTER COLUMN
  "user_id" DROP NOT NULL;

--> statement-breakpoint
UPDATE
  "batch_movement"
SET
  "user_id" = NULL;

ALTER TABLE
  "batch_movement"
ALTER COLUMN
  "user_id"
SET
  DATA TYPE uuid USING user_id::uuid;

--> statement-breakpoint
ALTER TABLE
  "task"
ALTER COLUMN
  "assigned_to_user_id" DROP NOT NULL;

--> statement-breakpoint
ALTER TABLE
  "task"
ALTER COLUMN
  "created_by_user_id" DROP NOT NULL;

--> statement-breakpoint
UPDATE
  "task"
SET
  "assigned_to_user_id" = NULL;

UPDATE
  "task"
SET
  "created_by_user_id" = NULL;

ALTER TABLE
  "task"
ALTER COLUMN
  "assigned_to_user_id"
SET
  DATA TYPE uuid USING assigned_to_user_id::uuid;

--> statement-breakpoint
ALTER TABLE
  "task"
ALTER COLUMN
  "created_by_user_id"
SET
  DATA TYPE uuid USING created_by_user_id::uuid;

--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE
  "batch_movement"
ADD
  CONSTRAINT "batch_movement_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;

EXCEPTION
WHEN duplicate_object THEN null;

END $$;

--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE
  "task"
ADD
  CONSTRAINT "task_assigned_to_user_id_profile_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;

EXCEPTION
WHEN duplicate_object THEN null;

END $$;

--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE
  "task"
ADD
  CONSTRAINT "task_created_by_user_id_profile_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;

EXCEPTION
WHEN duplicate_object THEN null;

END $$;