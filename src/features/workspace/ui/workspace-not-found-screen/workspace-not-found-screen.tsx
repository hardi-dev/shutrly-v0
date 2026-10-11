import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";

import { WORKSPACE_NOT_FOUND_COPY_NAMESPACE } from "./workspace-not-found-screen.copy";

/** Renders the workspace-scoped not-found state. @returns the not-found content */
export function WorkspaceNotFoundScreen() {
  const t = useTranslations(WORKSPACE_NOT_FOUND_COPY_NAMESPACE);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-(--space-4) p-(--space-6) text-center">
      <h1 className="text-(length:--font-size-display) font-bold">{t("title")}</h1>
      <p className="text-(--color-semantic-text-secondary)">{t("body")}</p>
      <Link href="/workspace">
        <Button variant="secondary">{t("back")}</Button>
      </Link>
    </div>
  );
}
