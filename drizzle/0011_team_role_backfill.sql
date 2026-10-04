-- Custom SQL migration file, put your code below! --
INSERT INTO "team_role" ("workspace_id", "name")
SELECT w."id", d.name
FROM "workspace" w
CROSS JOIN (VALUES ('Fotografer'), ('Videografer'), ('Asisten')) AS d(name)
WHERE NOT EXISTS (
  SELECT 1 FROM "team_role" r
  WHERE r."workspace_id" = w."id" AND lower(r."name") = lower(d.name))
ON CONFLICT DO NOTHING;
