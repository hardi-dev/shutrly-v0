CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"base_price" numeric(18, 3) NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "service_name_ck" CHECK (char_length("service"."name") between 1 and 60 and "service"."name" = btrim("service"."name")),
	CONSTRAINT "service_base_price_ck" CHECK ("service"."base_price" >= 0 and "service"."base_price" = trunc("service"."base_price") and "service"."base_price" <= 999999999999),
	CONSTRAINT "service_currency_ck" CHECK ("service"."currency" = 'IDR')
);
--> statement-breakpoint
CREATE TABLE "service_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_category_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "service_category_name_ck" CHECK (char_length("service_category"."name") between 1 and 60 and "service_category"."name" = btrim("service_category"."name"))
);
--> statement-breakpoint
CREATE TABLE "service_field_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"options" jsonb,
	"sort_order" integer NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_field_key_uq" UNIQUE("workspace_id","service_id","key"),
	CONSTRAINT "service_field_key_ck" CHECK ("service_field_definition"."key" ~ '^[a-z][a-z0-9_]{0,49}$'),
	CONSTRAINT "service_field_name_ck" CHECK (char_length("service_field_definition"."name") between 1 and 60 and "service_field_definition"."name" = btrim("service_field_definition"."name")),
	CONSTRAINT "service_field_type_ck" CHECK ("service_field_definition"."field_type" in ('TEXT','TEXTAREA','NUMBER','DATE','BOOLEAN','SELECT')),
	CONSTRAINT "service_field_options_ck" CHECK (("service_field_definition"."field_type" = 'SELECT') = ("service_field_definition"."options" is not null) and ("service_field_definition"."options" is null or jsonb_typeof("service_field_definition"."options") = 'array'))
);
--> statement-breakpoint
CREATE TABLE "service_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_item_definition_uq" UNIQUE("workspace_id","service_id","definition_id"),
	CONSTRAINT "service_item_value_ck" CHECK (jsonb_typeof("service_item"."value") = 'object')
);
--> statement-breakpoint
CREATE TABLE "service_item_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"value_type" text NOT NULL,
	"unit" text,
	"selection_required" boolean DEFAULT false NOT NULL,
	"selection_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_item_definition_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "service_item_definition_name_ck" CHECK (char_length("service_item_definition"."name") between 1 and 60 and "service_item_definition"."name" = btrim("service_item_definition"."name")),
	CONSTRAINT "service_item_definition_value_type_ck" CHECK ("service_item_definition"."value_type" in ('NUMBER','RANGE')),
	CONSTRAINT "service_item_definition_unit_ck" CHECK ("service_item_definition"."unit" is null or (char_length("service_item_definition"."unit") between 1 and 20 and "service_item_definition"."unit" = btrim("service_item_definition"."unit"))),
	CONSTRAINT "service_item_definition_selection_type_ck" CHECK ("service_item_definition"."selection_type" is null or "service_item_definition"."selection_type" in ('EDIT','PRINT')),
	CONSTRAINT "service_item_definition_selection_ck" CHECK ("service_item_definition"."selection_required" = ("service_item_definition"."selection_type" is not null)),
	CONSTRAINT "service_item_definition_selection_number_ck" CHECK (not "service_item_definition"."selection_required" or "service_item_definition"."value_type" = 'NUMBER')
);
--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_workspace_id_category_id_service_category_workspace_id_id_fk" FOREIGN KEY ("workspace_id","category_id") REFERENCES "public"."service_category"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_category" ADD CONSTRAINT "service_category_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_category" ADD CONSTRAINT "service_category_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_field_definition" ADD CONSTRAINT "service_field_definition_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_field_definition" ADD CONSTRAINT "service_field_definition_workspace_id_service_id_service_workspace_id_id_fk" FOREIGN KEY ("workspace_id","service_id") REFERENCES "public"."service"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_item" ADD CONSTRAINT "service_item_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_item" ADD CONSTRAINT "service_item_workspace_id_service_id_service_workspace_id_id_fk" FOREIGN KEY ("workspace_id","service_id") REFERENCES "public"."service"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_item" ADD CONSTRAINT "service_item_workspace_id_definition_id_service_item_definition_workspace_id_id_fk" FOREIGN KEY ("workspace_id","definition_id") REFERENCES "public"."service_item_definition"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD CONSTRAINT "service_item_definition_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_item_definition" ADD CONSTRAINT "service_item_definition_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "service_workspace_name_uq" ON "service" USING btree ("workspace_id",lower("name"));--> statement-breakpoint
CREATE INDEX "service_workspace_category_ix" ON "service" USING btree ("workspace_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_category_workspace_name_uq" ON "service_category" USING btree ("workspace_id",lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "service_field_name_uq" ON "service_field_definition" USING btree ("service_id",lower("name"));--> statement-breakpoint
CREATE INDEX "service_field_order_ix" ON "service_field_definition" USING btree ("service_id","sort_order");--> statement-breakpoint
CREATE INDEX "service_item_order_ix" ON "service_item" USING btree ("service_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "service_item_definition_workspace_name_uq" ON "service_item_definition" USING btree ("workspace_id",lower("name"));