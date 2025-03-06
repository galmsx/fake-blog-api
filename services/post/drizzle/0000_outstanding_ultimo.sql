CREATE SCHEMA "post";
--> statement-breakpoint
CREATE TABLE "post"."post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authorId" uuid,
	"title" text,
	"content" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
