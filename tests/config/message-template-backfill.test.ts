import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";

const HISTORICAL_0003_TEMPLATE_CONTENT: Record<string, string> = {
  GALLERY_SHARE: `Halo {{clientName}},

Gallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:
{{galleryUrl}}

Password: {{galleryPassword}}

Silakan pilih foto favoritmu. Terima kasih!`,
  SELECTION_REMINDER: `Halo {{clientName}},

Pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai. Lanjutkan memilih di sini:
{{galleryUrl}}

Terima kasih!`,
  FINAL_DELIVERY: `Halo {{clientName}},

Foto akhir {{projectTitle}} dari {{brandName}} sudah siap diunduh:
{{galleryUrl}}

Password: {{galleryPassword}}

Terima kasih sudah memercayakan momenmu kepada kami!`,
  INVOICE_SHARE: `Halo {{clientName}},

Invoice {{invoiceNumber}} untuk {{projectTitle}} dari {{brandName}} sudah terbit.
Total: {{invoiceTotal}}

Lihat dan bayar invoice di sini:
{{invoiceUrl}}

Terima kasih!`,
  PAYMENT_REMINDER: `Halo {{clientName}},

Pengingat dari {{brandName}}: invoice {{invoiceNumber}} untuk {{projectTitle}} masih memiliki sisa tagihan {{invoiceBalance}}.

Detail dan pembayaran:
{{invoiceUrl}}

Terima kasih!`,
};

const sql = readFileSync(
  new URL("../../drizzle/0003_message_template_backfill.sql", import.meta.url),
  "utf8",
);

describe("message template backfill migration", () => {
  it.each(TEMPLATE_TYPES)("AC-MSG-002 backfills the %s default verbatim", (type) => {
    expect(sql).toContain(`('${type}', $$${HISTORICAL_0003_TEMPLATE_CONTENT[type]}$$)`);
  });

  it("AC-MSG-002 is idempotent", () => {
    expect(sql).toContain('ON CONFLICT ("workspace_id", "type", "channel") DO NOTHING');
  });
});
