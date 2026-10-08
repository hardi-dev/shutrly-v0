"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/ui/cn/cn";
import { copyText, selectContents } from "@/ui/copy-text/copy-text";
import { showToast } from "@/ui/patterns/toast/toast";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { PROJECT_ACCESS_COPY as COPY } from "./project-access-card.copy";
import type { AccessRowProps } from "./project-access-card.types";

/** *Salin*: copies, or, when the browser refuses, shows the whole text selected for a manual copy. */
function useRowCopy(text: string | undefined) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectRequest, setSelectRequest] = useState(0);
  useEffect(() => {
    if (selectRequest > 0 && valueRef.current) selectContents(valueRef.current);
  }, [selectRequest]);
  const copy = async () => {
    if (text === undefined) return;
    if (await copyText(text)) {
      showToast({ tone: "success", title: COPY.copied });
      return;
    }
    setIsRevealed(true);
    setSelectRequest((count) => count + 1);
    showToast({ tone: "warning", title: COPY.copyFailedTitle, body: COPY.copyFailedBody });
  };
  return { valueRef, isRevealed, copy };
}

/** One fact of the card: label over value, with *Salin* when it can be copied; a refused clipboard shows the whole text selected (aksesklien-kartu rows). @param props - label, value, copy text and tone @returns the row */
export function AccessRow({ label, value, copy, isMuted = false }: Readonly<AccessRowProps>) {
  const { valueRef, isRevealed, copy: copyRow } = useRowCopy(copy?.text);
  const handleCopy = () => {
    void copyRow();
  };
  return (
    <div className="flex w-full items-center justify-between gap-(--space-3)">
      <div className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
        <span className="text-(length:--font-size-label) text-(--color-semantic-text-secondary)">
          {label}
        </span>
        <span
          ref={valueRef}
          className={cn(
            "text-(length:--font-size-body) font-medium",
            isRevealed ? "break-all select-all" : "truncate",
            isMuted
              ? "text-(--color-semantic-text-secondary)"
              : "text-(--color-semantic-text-primary)",
          )}
        >
          {isRevealed && copy ? copy.text : value}
        </span>
      </div>
      {copy ? (
        <IconButton icon="copy" size="sm" aria-label={copy.label} onPress={handleCopy} />
      ) : null}
    </div>
  );
}
