"use client";

import { cn } from "@/ui/cn/cn";
import { showToast } from "@/ui/patterns/toast/toast";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { PROJECT_ACCESS_COPY as COPY } from "./project-access-card.copy";
import type { AccessRowProps } from "./project-access-card.types";

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast({ tone: "success", title: COPY.copied });
  } catch {
    showToast({ tone: "danger", title: COPY.copyFailed });
  }
}

/** One fact of the card: label over value, with *Salin* when it can be copied (aksesklien-kartu rows). @param props - label, value, copy text and tone @returns the row */
export function AccessRow({ label, value, copy, isMuted = false }: Readonly<AccessRowProps>) {
  const handleCopy = () => {
    if (copy) void copyText(copy.text);
  };
  return (
    <div className="flex w-full items-center justify-between gap-(--space-3)">
      <div className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
        <span className="text-(length:--font-size-label) text-(--color-semantic-text-secondary)">
          {label}
        </span>
        <span
          className={cn(
            "truncate text-(length:--font-size-body) font-medium",
            isMuted
              ? "text-(--color-semantic-text-secondary)"
              : "text-(--color-semantic-text-primary)",
          )}
        >
          {value}
        </span>
      </div>
      {copy ? (
        <IconButton icon="copy" size="sm" aria-label={copy.label} onPress={handleCopy} />
      ) : null}
    </div>
  );
}
