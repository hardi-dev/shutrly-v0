import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { NOT_FOUND_COPY_NAMESPACE } from "./not-found.copy";

export default async function NotFound() {
  const t = await getTranslations(NOT_FOUND_COPY_NAMESPACE);
  const locale = await getLocale();
  return (
    <main
      lang={locale}
      className="flex min-h-dvh flex-col items-center justify-center gap-(--space-3) bg-(--color-semantic-surface-panel) p-(--space-6) text-center"
    >
      <p className="text-(length:--font-size-overline) font-semibold tracking-[1.5px] text-(--color-semantic-text-muted)">
        {t("code")}
      </p>
      <h1 className="text-(length:--font-size-heading) font-bold text-(--color-semantic-text-primary)">
        {t("title")}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {t("body")}
      </p>
      <Link
        href="/"
        className="text-(length:--font-size-body) font-semibold text-(--color-semantic-action-primary) underline-offset-4 hover:underline"
      >
        {t("home")}
      </Link>
    </main>
  );
}
