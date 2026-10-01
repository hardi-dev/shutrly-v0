import { Icon } from "@/ui/primitives/icon/icon";

import { MESSAGE_PREVIEW_COPY as COPY } from "./message-preview.copy";
import type { MessagePreviewProps } from "./message-preview.types";

/**
 * WhatsApp-style preview bubble, or its error state when the content can't be rendered
 * (AC-MSG-005, spec › UI States).
 * @param props - the rendered text (null = invalid) and whether to show the password note
 * @returns the preview region
 */
export function MessagePreview({ text, showsPasswordNote }: Readonly<MessagePreviewProps>) {
  return (
    <section aria-label={COPY.regionLabel} className="flex flex-col gap-(--space-3)">
      {text === null ? (
        <p
          role="status"
          className="flex items-center gap-(--space-2) rounded-(--radius-md) bg-(--color-semantic-surface-sunken) p-(--space-4) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)"
        >
          <Icon name="circle-alert" size="sm" className="text-(--component-input-error-text)" />
          {COPY.error}
        </p>
      ) : (
        <div className="rounded-(--radius-md) bg-(--color-semantic-surface-sunken) p-(--space-4)">
          <div className="flex flex-col gap-(--space-1) rounded-(--radius-md) border border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-3)">
            <p className="whitespace-pre-wrap break-words text-(length:--font-size-body) leading-(--font-line-height-body) text-(--color-semantic-text-primary)">
              {text}
            </p>
            <span className="self-end text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
              {COPY.time}
            </span>
          </div>
        </div>
      )}
      {showsPasswordNote && text !== null ? (
        <p className="text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
          {COPY.passwordNote}
        </p>
      ) : null}
    </section>
  );
}
