-- F-03 BR-MSG-005: give every existing workspace the five default templates (AC-MSG-002).
-- Idempotent: re-running inserts nothing for a workspace that already has a type.
INSERT INTO "message_template" ("workspace_id", "type", "channel", "content")
SELECT w."id", d."type", 'WHATSAPP', d."content"
FROM "workspace" w
CROSS JOIN (VALUES
  ('GALLERY_SHARE', $$Halo {{clientName}},

Gallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:
{{galleryUrl}}

Password: {{galleryPassword}}

Silakan pilih foto favoritmu. Terima kasih!$$),
  ('SELECTION_REMINDER', $$Halo {{clientName}}, pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai.

Lanjutkan memilih di sini:
{{galleryUrl}}

Terima kasih!$$),
  ('FINAL_DELIVERY', $$Halo {{clientName}}, foto akhir {{projectTitle}} sudah siap diunduh di gallery yang sama:
{{galleryUrl}}

Password: {{galleryPassword}}

Terima kasih sudah memercayakan momenmu kepada {{brandName}}!$$),
  ('INVOICE_SHARE', $$Halo {{clientName}}, invoice {{invoiceNumber}} untuk {{projectTitle}} sudah terbit.

Total: {{invoiceTotal}}
Lihat invoice di sini:
{{invoiceUrl}}

Terima kasih,
{{brandName}}$$),
  ('PAYMENT_REMINDER', $$Halo {{clientName}}, pengingat dari {{brandName}}: invoice {{invoiceNumber}} masih memiliki sisa tagihan {{invoiceBalance}}.

Detail dan pembayaran:
{{invoiceUrl}}

Terima kasih!$$)
) AS d("type", "content")
ON CONFLICT ("workspace_id", "type", "channel") DO NOTHING;
