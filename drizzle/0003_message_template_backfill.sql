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
  ('SELECTION_REMINDER', $$Halo {{clientName}},

Pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai. Lanjutkan memilih di sini:
{{galleryUrl}}

Terima kasih!$$),
  ('FINAL_DELIVERY', $$Halo {{clientName}},

Foto akhir {{projectTitle}} dari {{brandName}} sudah siap diunduh:
{{galleryUrl}}

Password: {{galleryPassword}}

Terima kasih sudah memercayakan momenmu kepada kami!$$),
  ('INVOICE_SHARE', $$Halo {{clientName}},

Invoice {{invoiceNumber}} untuk {{projectTitle}} dari {{brandName}} sudah terbit.
Total: {{invoiceTotal}}

Lihat dan bayar invoice di sini:
{{invoiceUrl}}

Terima kasih!$$),
  ('PAYMENT_REMINDER', $$Halo {{clientName}},

Pengingat dari {{brandName}}: invoice {{invoiceNumber}} untuk {{projectTitle}} masih memiliki sisa tagihan {{invoiceBalance}}.

Detail dan pembayaran:
{{invoiceUrl}}

Terima kasih!$$)
) AS d("type", "content")
ON CONFLICT ("workspace_id", "type", "channel") DO NOTHING;
