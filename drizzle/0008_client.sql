CREATE TABLE "client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"whatsapp_number" text,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "client_name_ck" CHECK (char_length("client"."name") between 1 and 100 and "client"."name" = btrim("client"."name")),
	CONSTRAINT "client_whatsapp_number_ck" CHECK ("client"."whatsapp_number" is null or ("client"."whatsapp_number" ~ '^[1-9][0-9]{9,14}$' and "client"."whatsapp_number" !~ '^620')),
	CONSTRAINT "client_social_links_ck" CHECK (jsonb_typeof("client"."social_links") = 'array' and jsonb_array_length("client"."social_links") <= 10)
);
--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "client_workspace_whatsapp_uq" ON "client" USING btree ("workspace_id","whatsapp_number");--> statement-breakpoint
CREATE INDEX "client_workspace_list_idx" ON "client" USING btree ("workspace_id",lower("name"),"created_at","id");