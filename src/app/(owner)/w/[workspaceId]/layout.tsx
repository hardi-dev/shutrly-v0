import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth/login";
import { setOwnerLocaleAction } from "@/app/actions/auth/profile";
import { PROJECT_MENU_ACTIONS } from "@/app/actions/booking/project-menu-actions";
import { markDeliveredAction } from "@/app/actions/gallery/delivery";
import { loadGalleryShareAction } from "@/app/actions/gallery/gallery-share";
import { createWorkspaceAction } from "@/app/actions/workspace/create";
import { switchWorkspaceAction } from "@/app/actions/workspace/switch";
import { requireOwnerOrRedirect } from "@/composition/auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { loadWorkspaceSwitcher } from "@/composition/workspace/workspace-flow/workspace-flow";
import { messageTemplateSubPages } from "@/features/communications/ui/template-sub-pages/template-sub-pages";
import { OwnerShell } from "@/features/workspace/ui/owner-shell/owner-shell";

import {
  MESSAGE_TEMPLATE_SUB_PAGES_COPY_NAMESPACE,
  WORKSPACE_LAYOUT_COPY_NAMESPACE,
} from "./layout.copy";
import { ProjectGalleryHost } from "./project-gallery-host";
import type { ProjectGalleryHostActions } from "./project-gallery-host.types";

// The share dialog, the client number dialog and Tandai terkirim are mounted once per workspace (A-8, A-10).
const GALLERY_HOST_ACTIONS: ProjectGalleryHostActions = {
  loadShare: loadGalleryShareAction,
  markDeliveredAction,
  loadDetailAction: PROJECT_MENU_ACTIONS.loadDetailAction,
  loadClientAction: PROJECT_MENU_ACTIONS.loadClientAction,
  updateClientAction: PROJECT_MENU_ACTIONS.updateClientAction,
};

export default async function WorkspaceLayout({
  children,
  crumbs,
  heading,
  params,
}: Readonly<{
  children: ReactNode;
  crumbs: ReactNode;
  heading: ReactNode;
  params: Promise<{ workspaceId: string }>;
}>) {
  const { workspaceId } = await params;
  const t = await getTranslations(WORKSPACE_LAYOUT_COPY_NAMESPACE);
  const templateT = await getTranslations(MESSAGE_TEMPLATE_SUB_PAGES_COPY_NAMESPACE);
  const [account, verified, workspaces] = await Promise.all([
    requireOwnerOrRedirect(),
    verifyOwnerWorkspace(workspaceId),
    loadWorkspaceSwitcher(workspaceId),
  ]);
  return (
    <OwnerShell
      workspaceId={workspaceId}
      workspaceName={verified.workspace.name}
      accountName={account.name}
      accountEmail={account.email}
      title={t("title")}
      workspaces={workspaces}
      onSwitch={switchWorkspaceAction}
      onCreate={createWorkspaceAction}
      logoutAction={logoutAction}
      localeAction={setOwnerLocaleAction}
      subPages={messageTemplateSubPages(templateT, workspaceId)}
      trail={crumbs}
      pageHeading={heading}
    >
      <ProjectGalleryHost workspaceId={workspaceId} actions={GALLERY_HOST_ACTIONS}>
        {children}
      </ProjectGalleryHost>
    </OwnerShell>
  );
}
