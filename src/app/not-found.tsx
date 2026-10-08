import Link from "next/link";

import { NOT_FOUND_COPY as COPY } from "./not-found.copy";

export default function NotFound() {
  return (
    <main
      lang="en"
      className="flex min-h-dvh flex-col items-center justify-center gap-(--space-3) bg-(--color-semantic-surface-panel) p-(--space-6) text-center"
    >
      <p className="text-(length:--font-size-overline) font-semibold tracking-[1.5px] text-(--color-semantic-text-muted)">
        {COPY.code}
      </p>
      <h1 className="text-(length:--font-size-heading) font-bold text-(--color-semantic-text-primary)">
        {COPY.title}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {COPY.body}
      </p>
      <Link
        href="/"
        className="text-(length:--font-size-body) font-semibold text-(--color-semantic-action-primary) underline-offset-4 hover:underline"
      >
        {COPY.home}
      </Link>
    </main>
  );
}
