CREATE SCHEMA "user";
--> statement-breakpoint
CREATE TYPE "public"."UserType" AS ENUM('USER');--> statement-breakpoint
CREATE TABLE "user"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"name" text,
	"type" "UserType",
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"password" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
