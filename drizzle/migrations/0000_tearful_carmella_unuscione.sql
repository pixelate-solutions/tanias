CREATE TABLE "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"location" text NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"location" text NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
