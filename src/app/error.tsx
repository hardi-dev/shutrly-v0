"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";

import { ERROR_COPY_NAMESPACE } from "./error.copy";
import type { ErrorPageProps } from "./error.types";

// Never render error.message: server errors can carry internals (C-103). onRequestError logs them.
export default function ErrorPage({ reset }: Readonly<ErrorPageProps>) {
  const t = useTranslations(ERROR_COPY_NAMESPACE);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-(--space-4) p-(--space-6) text-center">
      <h1 className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)">
        {t("title")}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {t("body")}
      </p>
      <Button variant="secondary" onPress={reset}>
        {t("retry")}
      </Button>
    </main>
  );
}
