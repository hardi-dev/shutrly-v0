CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" text NOT NULL,
	"name" text NOT NULL,
	"brand_name" text,
	"contact_email" text,
	"phone" text,
	"address" text,
	"invoice_prefix" text NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"last_opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_name_ck" CHECK (char_length("workspace"."name") between 1 and 60),
	CONSTRAINT "workspace_brand_name_ck" CHECK ("workspace"."brand_name" is null or char_length("workspace"."brand_name") <= 80),
	CONSTRAINT "workspace_contact_email_ck" CHECK ("workspace"."contact_email" is null or char_length("workspace"."contact_email") <= 254),
	CONSTRAINT "workspace_phone_ck" CHECK ("workspace"."phone" is null or "workspace"."phone" ~ '^[0-9 +()\-]{8,20}$'),
	CONSTRAINT "workspace_address_ck" CHECK ("workspace"."address" is null or char_length("workspace"."address") <= 300),
	CONSTRAINT "workspace_invoice_prefix_ck" CHECK ("workspace"."invoice_prefix" ~ '^[A-Z0-9]{2,6}$'),
	CONSTRAINT "workspace_currency_ck" CHECK ("workspace"."currency" = 'IDR')
);
--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_owner_name_uq" ON "workspace" USING btree ("owner_user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "workspace_owner_last_opened_ix" ON "workspace" USING btree ("owner_user_id","last_opened_at" desc);