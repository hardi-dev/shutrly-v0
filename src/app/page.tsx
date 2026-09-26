import { HOME_PAGE_COPY } from "./page.copy";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-(--space-2) p-(--space-6)">
      <p className="flex items-center gap-(--space-2)">
        <span
          aria-hidden="true"
          className="size-4 rounded-(--radius-xs) bg-(--color-semantic-accent-highlight)"
        />
        <span className="text-(length:--font-size-title) font-bold">{HOME_PAGE_COPY.wordmark}</span>
      </p>
      <h1 className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {HOME_PAGE_COPY.status}
      </h1>
    </main>
  );
}
