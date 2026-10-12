import { getTranslations } from "next-intl/server";

import { dashboardTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

import { OWNER_NAV_COPY_NAMESPACE, PAGE_HEADER_COPY_NAMESPACE } from "./page.copy";

export default async function DashboardCrumbs() {
  const t = await getTranslations(OWNER_NAV_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);
  return <PageHeaderTrail items={dashboardTrail(t)} label={crumbT("breadcrumb")} />;
}
