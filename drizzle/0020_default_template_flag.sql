ALTER TABLE "message_template" DROP CONSTRAINT "message_template_content_ck";--> statement-breakpoint
ALTER TABLE "message_template" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "message_template" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_custom_content_ck" CHECK ("message_template"."is_default" or "message_template"."content" is not null);--> statement-breakpoint
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_content_ck" CHECK ("message_template"."content" is null or char_length("message_template"."content") between 1 and 2000);--> statement-breakpoint
-- §4.3: a row whose text equals a 0003 default byte for byte was never edited, so it becomes a platform default.
-- Every other row is an owner edit and stays custom. No content is rewritten.
UPDATE "message_template" SET "is_default" = true
WHERE ("type", "content") IN (
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
);
