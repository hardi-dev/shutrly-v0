import type { ClientHeaderProps } from "./client-header.types";

/** The client brand bar: studio mark and name, and the project title (local *Client Header* gloCE / Qk0C6, D-21). @param props - studio and project names @returns the header */
export function ClientHeader({ studioName, projectTitle }: Readonly<ClientHeaderProps>) {
  return (
    <header className="w-full shrink-0 border-b border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-4) md:px-(--space-10)">
      <div className="mx-auto flex w-full max-w-(--size-content-max) items-center justify-between gap-(--space-3)">
        <div className="flex min-w-0 items-center gap-(--space-2)">
          <span
            aria-hidden="true"
            className="flex size-(--space-8) shrink-0 items-center justify-center rounded-(--radius-sm) bg-(--color-semantic-accent-highlight) text-(length:--font-size-body) font-bold text-(--color-semantic-accent-on-highlight)"
          >
            {studioName.slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate text-(length:--font-size-subtitle) font-bold text-(--color-semantic-text-primary)">
            {studioName}
          </span>
        </div>
        <span className="truncate text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
          {projectTitle}
        </span>
      </div>
    </header>
  );
}
