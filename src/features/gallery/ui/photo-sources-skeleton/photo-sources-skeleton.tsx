import { SOURCE_COPY } from "../source-copy/source-copy.copy";

export function PhotoSourcesSkeleton() {
  return (
    <div
      aria-label={SOURCE_COPY.loading}
      className="mx-auto h-96 w-full max-w-[720px] animate-pulse rounded-(--component-section-card-radius) bg-(--color-semantic-surface-muted)"
    />
  );
}
