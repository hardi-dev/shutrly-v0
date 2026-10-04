CREATE TABLE "session_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_assignment_member_uq" UNIQUE("session_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"whatsapp_number" text NOT NULL,
	"email" text,
	"archived_at" timestamp with time zone,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_member_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "team_member_name_ck" CHECK (char_length("team_member"."name") between 1 and 100 and "team_member"."name" = btrim("team_member"."name")),
	CONSTRAINT "team_member_whatsapp_number_ck" CHECK ("team_member"."whatsapp_number" ~ '^[1-9][0-9]{9,14}$' and "team_member"."whatsapp_number" !~ '^620'),
	CONSTRAINT "team_member_email_ck" CHECK ("team_member"."email" is null or (char_length("team_member"."email") <= 254 and "team_member"."email" = lower("team_member"."email")))
);
--> statement-breakpoint
CREATE TABLE "team_member_role" (
	"workspace_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_member_role_member_id_role_id_pk" PRIMARY KEY("member_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "team_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_role_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "team_role_name_ck" CHECK (char_length("team_role"."name") between 1 and 50 and "team_role"."name" = btrim("team_role"."name"))
);
--> statement-breakpoint
ALTER TABLE "project_session" ADD CONSTRAINT "project_session_project_key_uq" UNIQUE("workspace_id","project_id","id");
--> statement-breakpoint
ALTER TABLE "session_assignment" ADD CONSTRAINT "session_assignment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assignment" ADD CONSTRAINT "session_assignment_workspace_id_project_id_session_id_project_session_workspace_id_project_id_id_fk" FOREIGN KEY ("workspace_id","project_id","session_id") REFERENCES "public"."project_session"("workspace_id","project_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assignment" ADD CONSTRAINT "session_assignment_workspace_id_member_id_team_member_workspace_id_id_fk" FOREIGN KEY ("workspace_id","member_id") REFERENCES "public"."team_member"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assignment" ADD CONSTRAINT "session_assignment_workspace_id_role_id_team_role_workspace_id_id_fk" FOREIGN KEY ("workspace_id","role_id") REFERENCES "public"."team_role"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_role" ADD CONSTRAINT "team_member_role_workspace_id_member_id_team_member_workspace_id_id_fk" FOREIGN KEY ("workspace_id","member_id") REFERENCES "public"."team_member"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_role" ADD CONSTRAINT "team_member_role_workspace_id_role_id_team_role_workspace_id_id_fk" FOREIGN KEY ("workspace_id","role_id") REFERENCES "public"."team_role"("workspace_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_role" ADD CONSTRAINT "team_role_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_role" ADD CONSTRAINT "team_role_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_assignment_session_ix" ON "session_assignment" USING btree ("session_id","created_at","id");--> statement-breakpoint
CREATE INDEX "session_assignment_project_ix" ON "session_assignment" USING btree ("workspace_id","project_id");--> statement-breakpoint
CREATE INDEX "session_assignment_member_ix" ON "session_assignment" USING btree ("workspace_id","member_id");--> statement-breakpoint
CREATE INDEX "session_assignment_role_ix" ON "session_assignment" USING btree ("workspace_id","role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_member_workspace_whatsapp_uq" ON "team_member" USING btree ("workspace_id","whatsapp_number");--> statement-breakpoint
CREATE INDEX "team_member_workspace_list_idx" ON "team_member" USING btree ("workspace_id",lower("name"),"created_at","id");--> statement-breakpoint
CREATE INDEX "team_member_role_role_ix" ON "team_member_role" USING btree ("workspace_id","role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_role_workspace_name_uq" ON "team_role" USING btree ("workspace_id",lower("name"));
