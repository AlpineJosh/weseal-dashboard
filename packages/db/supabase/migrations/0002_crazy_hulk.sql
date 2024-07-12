CREATE TABLE IF NOT EXISTS "sage"."sync_job" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_name" varchar NOT NULL,
	"job_start" timestamp NOT NULL,
	"job_end" timestamp,
	"status" varchar NOT NULL,
	"interval_start" timestamp,
	"interval_end" timestamp
);
