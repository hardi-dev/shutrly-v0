import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";

import { COMING_SOON_COPY_NAMESPACE } from "./coming-soon-screen.copy";
import type { ComingSoonScreenProps } from "./coming-soon-screen.types";

/** Renders a static placeholder for an unimplemented workspace section; the shell Page Header names the section. @param props - workspace route identity @returns the coming-soon content */
export function ComingSoonScreen({ workspaceId }: Readonly<ComingSoonScreenProps>) {
  const t = useTranslations(COMING_SOON_COPY_NAMESPACE);
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-(--space-4) text-center">
      <h2 className="text-(length:--font-size-title) font-bold tracking-(--font-letter-spacing-title) text-(--color-semantic-text-primary)">
        {t("title")}
      </h2>
      <p className="text-(--color-semantic-text-secondary)">{t("body")}</p>
      <Link href={`/w/${workspaceId}`}>
        <Button variant="secondary">{t("back")}</Button>
      </Link>
    </div>
  );
}
