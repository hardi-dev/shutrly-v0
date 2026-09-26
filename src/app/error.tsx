"use client";

import { Button } from "@/ui/primitives/button/button";

import { ERROR_PAGE_COPY } from "./error.copy";
import type { ErrorPageProps } from "./error.types";

// Never render error.message: server errors can carry internals (C-103). onRequestError logs them.
export default function ErrorPage({ reset }: Readonly<ErrorPageProps>) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-(--space-4) p-(--space-6) text-center">
      <h1 className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)">
        {ERROR_PAGE_COPY.title}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {ERROR_PAGE_COPY.body}
      </p>
      <Button variant="secondary" onPress={reset}>
        {ERROR_PAGE_COPY.retry}
      </Button>
    </main>
  );
}
