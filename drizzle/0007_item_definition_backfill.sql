-- Custom SQL migration file, put your code below! --
INSERT INTO "service_item_definition" ("workspace_id","name","value_type","unit","selection_required","selection_type")
SELECT w."id", d.name, d.value_type, d.unit, d.selection_required, d.selection_type
FROM "workspace" w
CROSS JOIN (VALUES
  ('Foto edit','NUMBER','foto',true,'EDIT'),
  ('Foto cetak','NUMBER','lembar',true,'PRINT'),
  ('Jumlah orang','RANGE','orang',false,NULL),
  ('Durasi pemotretan','NUMBER','jam',false,NULL)
) AS d(name, value_type, unit, selection_required, selection_type)
WHERE NOT EXISTS (
  SELECT 1 FROM "service_item_definition" s
  WHERE s."workspace_id" = w."id" AND lower(s."name") = lower(d.name))
ON CONFLICT DO NOTHING;
