CREATE TABLE IF NOT EXISTS "profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255)
);

--> statement-breakpoint
DO $ $ BEGIN
ALTER TABLE
	"profile"
ADD
	CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION
WHEN duplicate_object THEN null;

END $ $;