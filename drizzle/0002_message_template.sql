CREATE TABLE "message_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" text NOT NULL,
	"channel" text DEFAULT 'WHATSAPP' NOT NULL,
	"content" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_template_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "message_template_type_ck" CHECK ("message_template"."type" in ('GALLERY_SHARE','SELECTION_REMINDER','FINAL_DELIVERY','INVOICE_SHARE','PAYMENT_REMINDER')),
	CONSTRAINT "message_template_channel_ck" CHECK ("message_template"."channel" = 'WHATSAPP'),
	CONSTRAINT "message_template_content_ck" CHECK (char_length("message_template"."content") between 1 and 2000)
);
--> statement-breakpoint
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "message_template_workspace_type_channel_uq" ON "message_template" USING btree ("workspace_id","type","channel");