import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth/login";
import { setOwnerLocaleAction } from "@/app/actions/auth/profile";
import { createWorkspaceAction } from "@/app/actions/workspace/create";
import { switchWorkspaceAction } from "@/app/actions/workspace/switch";
import { requireOwnerOrRedirect } from "@/composition/auth/owner-guard/owner-guard";
import { resolveOwnerHome } from "@/composition/workspace/owner-workspace/owner-workspace";
import { loadWorkspaceSwitcher } from "@/composition/workspace/workspace-flow/workspace-flow";
import { OwnerShell } from "@/features/workspace/ui/owner-shell/owner-shell";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

import { PAGE_HEADER_COPY_NAMESPACE, PROFILE_LAYOUT_COPY_NAMESPACE } from "./layout.copy";

export default async function ProfileLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [account, workspace] = await Promise.all([requireOwnerOrRedirect(), resolveOwnerHome()]);
  const workspaces = await loadWorkspaceSwitcher(workspace.id);
  const t = await getTranslations(PROFILE_LAYOUT_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);

  return (
    <OwnerShell
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      accountName={account.name}
      accountEmail={account.email}
      title={t("title")}
      workspaces={workspaces}
      onSwitch={switchWorkspaceAction}
      onCreate={createWorkspaceAction}
      logoutAction={logoutAction}
      localeAction={setOwnerLocaleAction}
      trail={<PageHeaderTrail items={[{ label: t("title") }]} label={crumbT("breadcrumb")} />}
    >
      {children}
    </OwnerShell>
  );
}
