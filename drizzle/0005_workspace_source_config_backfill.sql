-- Custom SQL migration file, put your code below! --
INSERT INTO "workspace_source_config" ("workspace_id", "provider", "display_name")
SELECT w."id", 'GOOGLE_DRIVE', 'Google Drive' FROM "workspace" w
WHERE NOT EXISTS (SELECT 1 FROM "workspace_source_config" s WHERE s."workspace_id" = w."id")
ON CONFLICT DO NOTHING;
