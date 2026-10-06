"use client";

import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { DELIVERY_SCREEN_COPY as COPY } from "./delivery-screen.copy";
import type { DeliveryPartProps } from "./delivery-screen.types";
import { failedBody } from "./delivery-screen-text";

function ProgressCard({ screen }: Readonly<DeliveryPartProps>) {
  const { done, total } = screen.download.progress;
  const ratio = total === 0 ? 0 : done / total;
  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-(--space-3) rounded-(--radius-lg) border border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-4)"
    >
      <div className="flex items-center justify-between gap-(--space-2)">
        <h2 className="text-(length:--font-size-subtitle) font-bold text-(--color-semantic-text-primary)">
          {COPY.progressTitle}
        </h2>
        <StatusChip tone="info" label={COPY.running} hasDot />
      </div>
      <div className="h-(--space-1-5) w-full overflow-hidden rounded-(--radius-full) bg-(--color-semantic-surface-subtle)">
        <div
          className="h-full rounded-(--radius-full) bg-(--color-semantic-progress-positive)"
          style={{ width: `${String(Math.round(ratio * 100))}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
        <p className="flex-1 text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {COPY.progress(done, total)}
        </p>
        <Button variant="secondary" onPress={screen.download.cancel}>
          {COPY.stop}
        </Button>
      </div>
    </section>
  );
}

/** Above the files: *Hasil akhir sudah tersedia*, the progress card while downloading, or the failure alert with *Coba lagi* (hasilakhir-siap / -mengunduh-semua / -gagal-unduh, AC-DEL-003, -005). @param props - the screen state @returns the status */
export function DeliveryStatus({ screen }: Readonly<DeliveryPartProps>) {
  const { progress } = screen.download;
  if (progress.phase === "RUNNING") return <ProgressCard screen={screen} />;
  if (progress.phase === "DONE" && screen.failedNames.length > 0) {
    return (
      <Alert
        tone="danger"
        live
        title={COPY.failedTitle(screen.failedNames.length)}
        body={failedBody(screen.failedNames)}
        action={{ label: COPY.retry, onAction: screen.download.retry }}
      />
    );
  }
  return <Alert tone="success" title={COPY.readyTitle} body={COPY.readyBody} />;
}
