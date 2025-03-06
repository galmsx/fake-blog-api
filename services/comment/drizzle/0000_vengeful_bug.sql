CREATE SCHEMA "comment";
--> statement-breakpoint
CREATE TABLE "comment"."comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authorId" uuid,
	"itemId" uuid,
	"content" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
