CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"agreed_price" numeric(18, 3) NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" text NOT NULL,
	"client_access_token" text NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"cancel_reason" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "project_title_ck" CHECK (char_length("project"."title") between 1 and 100 and "project"."title" = btrim("project"."title")),
	CONSTRAINT "project_notes_ck" CHECK ("project"."notes" is null or char_length("project"."notes") <= 2000),
	CONSTRAINT "project_price_ck" CHECK ("project"."agreed_price" >= 0 and "project"."agreed_price" = trunc("project"."agreed_price") and "project"."agreed_price" <= 999999999999),
	CONSTRAINT "project_currency_ck" CHECK ("project"."currency" = 'IDR'),
	CONSTRAINT "project_status_ck" CHECK ("project"."status" in ('DRAFT','BOOKED','SHOOTING','POST_PROCESSING','DELIVERED','COMPLETED','CANCELLED')),
	CONSTRAINT "project_token_ck" CHECK ("project"."client_access_token" ~ '^[A-Za-z0-9_-]{43}$'),
	CONSTRAINT "project_cancel_ck" CHECK (("project"."status" = 'CANCELLED') = ("project"."cancelled_at" is not null)),
	CONSTRAINT "project_cancel_reason_ck" CHECK ("project"."cancel_reason" is null or char_length("project"."cancel_reason") <= 500)
);
--> statement-breakpoint
CREATE TABLE "project_field_value" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"field_name" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean NOT NULL,
	"options" jsonb,
	"value" jsonb,
	"sort_order" integer NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_field_value_key_uq" UNIQUE("project_id","field_key"),
	CONSTRAINT "project_field_value_type_ck" CHECK ("project_field_value"."field_type" in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')),
	CONSTRAINT "project_field_value_options_ck" CHECK (("project_field_value"."field_type" = 'SELECT') = ("project_field_value"."options" is not null))
);
--> statement-breakpoint
CREATE TABLE "project_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"name" text NOT NULL,
	"value_type" text NOT NULL,
	"value" jsonb NOT NULL,
	"unit" text,
	"selection_required" boolean NOT NULL,
	"selection_type" text,
	"sort_order" integer NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_item_definition_uq" UNIQUE("workspace_id","project_id","definition_id"),
	CONSTRAINT "project_item_value_type_ck" CHECK ("project_item"."value_type" in ('NUMBER','RANGE')),
	CONSTRAINT "project_item_value_ck" CHECK (jsonb_typeof("project_item"."value") = 'object'),
	CONSTRAINT "project_item_selection_ck" CHECK ("project_item"."selection_required" = ("project_item"."selection_type" is not null)),
	CONSTRAINT "project_item_selection_type_ck" CHECK ("project_item"."selection_type" is null or "project_item"."selection_type" in ('EDIT','PRINT')),
	CONSTRAINT "project_item_selection_number_ck" CHECK (not "project_item"."selection_required" or "project_item"."value_type" = 'NUMBER')
);
--> statement-breakpoint
CREATE TABLE "project_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"session_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"location" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_session_name_ck" CHECK (char_length("project_session"."name") between 1 and 100 and "project_session"."name" = btrim("project_session"."name")),
	CONSTRAINT "project_session_location_ck" CHECK ("project_session"."location" is null or char_length("project_session"."location") <= 200),
	CONSTRAINT "project_session_time_ck" CHECK ("project_session"."end_time" is null or ("project_session"."start_time" is not null and "project_session"."end_time" > "project_session"."start_time"))
);
--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_client_id_client_workspace_id_id_fk" FOREIGN KEY ("workspace_id","client_id") REFERENCES "public"."client"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_service_id_service_workspace_id_id_fk" FOREIGN KEY ("workspace_id","service_id") REFERENCES "public"."service"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_field_value" ADD CONSTRAINT "project_field_value_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_field_value" ADD CONSTRAINT "project_field_value_workspace_id_project_id_project_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_id") REFERENCES "public"."project"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_workspace_id_project_id_project_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_id") REFERENCES "public"."project"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_item" ADD CONSTRAINT "project_item_workspace_id_definition_id_service_item_definition_workspace_id_id_fk" FOREIGN KEY ("workspace_id","definition_id") REFERENCES "public"."service_item_definition"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_session" ADD CONSTRAINT "project_session_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_session" ADD CONSTRAINT "project_session_workspace_id_project_id_project_workspace_id_id_fk" FOREIGN KEY ("workspace_id","project_id") REFERENCES "public"."project"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_access_token_uq" ON "project" USING btree ("client_access_token");--> statement-breakpoint
CREATE INDEX "project_workspace_status_ix" ON "project" USING btree ("workspace_id","status","created_at");--> statement-breakpoint
CREATE INDEX "project_workspace_client_ix" ON "project" USING btree ("workspace_id","client_id");--> statement-breakpoint
CREATE INDEX "project_workspace_service_ix" ON "project" USING btree ("workspace_id","service_id");--> statement-breakpoint
CREATE INDEX "project_item_order_ix" ON "project_item" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "project_session_order_ix" ON "project_session" USING btree ("project_id","session_date","start_time","created_at");