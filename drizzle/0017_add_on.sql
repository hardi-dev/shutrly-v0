CREATE TABLE "project_add_on" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"selection_group_id" uuid,
	"description" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(18, 3) NOT NULL,
	"total_amount" numeric(18, 3) NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" text,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_add_on_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "project_add_on_description_ck" CHECK (char_length("project_add_on"."description") between 1 and 100 and "project_add_on"."description" = btrim("project_add_on"."description")),
	CONSTRAINT "project_add_on_quantity_ck" CHECK ("project_add_on"."quantity" >= 1),
	CONSTRAINT "project_add_on_unit_price_ck" CHECK ("project_add_on"."unit_price" >= 0 and "project_add_on"."unit_price" = trunc("project_add_on"."unit_price")),
	CONSTRAINT "project_add_on_total_ck" CHECK ("project_add_on"."total_amount" = "project_add_on"."quantity" * "project_add_on"."unit_price"),
	CONSTRAINT "project_add_on_currency_ck" CHECK ("project_add_on"."currency" = 'IDR'),
	CONSTRAINT "project_add_on_status_ck" CHECK ("project_add_on"."status" in ('DRAFT','APPROVED','CANCELLED')),
	CONSTRAINT "project_add_on_cancelled_ck" CHECK (("project_add_on"."status" = 'CANCELLED') = ("project_add_on"."cancelled_at" is not null)),
	CONSTRAINT "project_add_on_approved_ck" CHECK ("project_add_on"."status" in ('DRAFT','CANCELLED') or "project_add_on"."approved_at" is not null),
	CONSTRAINT "project_add_on_draft_ck" CHECK ("project_add_on"."status" <> 'DRAFT' or "project_add_on"."approved_at" is null)
);
--> statement-breakpoint
ALTER TABLE "project_add_on" ADD CONSTRAINT "project_add_on_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_add_on" ADD CONSTRAINT "project_add_on_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_add_on" ADD CONSTRAINT "project_add_on_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_add_on" ADD CONSTRAINT "project_add_on_workspace_id_project_id_project_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_id") REFERENCES "public"."project"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_add_on" ADD CONSTRAINT "project_add_on_workspace_id_selection_group_id_selection_group_workspace_id_id_fk" FOREIGN KEY ("workspace_id","selection_group_id") REFERENCES "public"."selection_group"("workspace_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_add_on_project_ix" ON "project_add_on" USING btree ("project_id","created_at");