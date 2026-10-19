import { getTranslations } from "next-intl/server";

import { OwnerPageHeading } from "@/features/workspace/ui/owner-page-heading/owner-page-heading";

import { COMPACT_BAR_COPY_NAMESPACE } from "./page.copy";
import { NEW_PROJECT_PAGE_COPY_NAMESPACE } from "./page.copy";

export default async function NewProjectHeading({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const t = await getTranslations(NEW_PROJECT_PAGE_COPY_NAMESPACE);
  const backT = await getTranslations(COMPACT_BAR_COPY_NAMESPACE);
  return (
    <OwnerPageHeading
      title={t("createTitle")}
      subtitle={t("createSubtitle")}
      parent={{ label: t("parentLabel"), href: `/w/${workspaceId}/projects` }}
      backLabel={backT("back")}
    />
  );
}
