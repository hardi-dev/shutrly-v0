"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ClientDialog } from "@/features/booking/ui/client-dialog/client-dialog";
import { GalleryShareDialog } from "@/features/gallery/ui/gallery-share-dialog/gallery-share-dialog";
import { MarkDeliveredDialog } from "@/features/gallery/ui/mark-delivered-button/mark-delivered-button";
import { useMarkDelivered } from "@/features/gallery/ui/mark-delivered-button/use-mark-delivered";
import { ProjectGalleryActionsProvider } from "@/ui/hooks/use-project-gallery-actions/use-project-gallery-actions";
import type { MarkDeliveredTarget } from "@/ui/hooks/use-project-gallery-actions/use-project-gallery-actions.types";

import type {
  MarkDeliveredLayerProps,
  ProjectGalleryHostProps,
  ShareLayerProps,
} from "./project-gallery-host.types";
import { useClientNumberFlow } from "./use-client-number-flow";

/**
 * The workspace's app-level gallery host (F-27 A-8, A-10, AC-GFL-024): it owns the share dialog, the
 * booking client dialog for *Tambah nomor WhatsApp* and the *Tandai terkirim* confirm, and gives every
 * menu and gallery card below it the `openShare` and `openMarkDelivered` actions.
 * @param props - the workspace, the server actions and the children
 * @returns the children with the dialogs mounted beside them
 */
export function ProjectGalleryHost({
  workspaceId,
  actions,
  children,
}: Readonly<ProjectGalleryHostProps>) {
  const router = useRouter();
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [markTarget, setMarkTarget] = useState<MarkDeliveredTarget | null>(null);
  const gallery = { openShare: setShareProjectId, openMarkDelivered: setMarkTarget };
  const closeShare = (isOpen: boolean) => {
    if (!isOpen) setShareProjectId(null);
  };
  const finishMark = () => {
    setMarkTarget(null);
    router.refresh();
  };
  return (
    <ProjectGalleryActionsProvider value={gallery}>
      {children}
      <ShareLayer
        workspaceId={workspaceId}
        projectId={shareProjectId}
        actions={actions}
        onOpenChange={closeShare}
      />
      {markTarget ? (
        <MarkDeliveredLayer
          workspaceId={workspaceId}
          target={markTarget}
          markDeliveredAction={actions.markDeliveredAction}
          onDone={finishMark}
        />
      ) : null}
    </ProjectGalleryActionsProvider>
  );
}

/**
 * The share dialog and, behind *Tambah nomor WhatsApp*, the booking client dialog; saving the number
 * reloads the share message (A-8, AC-GFL-024).
 * @param props - the workspace, the shared project (null when closed), the server actions and the close handler
 * @returns the share dialog and the client dialog while it is open
 */
function ShareLayer({ workspaceId, projectId, actions, onOpenChange }: Readonly<ShareLayerProps>) {
  const router = useRouter();
  const [revision, setRevision] = useState(0);
  const reloadShare = () => {
    setRevision((count) => count + 1);
    router.refresh();
  };
  const number = useClientNumberFlow({ workspaceId, projectId, actions, onSaved: reloadShare });
  return (
    <>
      <GalleryShareDialog
        isOpen={projectId !== null}
        onOpenChange={onOpenChange}
        workspaceId={workspaceId}
        projectId={projectId ?? ""}
        loadShare={actions.loadShare}
        onAddNumber={number.open}
        revision={revision}
      />
      {number.client ? (
        <ClientDialog
          isOpen
          mode="edit"
          client={number.client}
          workspaceId={workspaceId}
          onOpenChange={number.close}
          onSubmit={number.save}
        />
      ) : null}
    </>
  );
}

/** The *Tandai terkirim* confirm for one project, mounted while it is open (AC-GFL-017). @param props - ids, the title, the server action and the close handler @returns the confirm dialog */
function MarkDeliveredLayer({
  workspaceId,
  target,
  markDeliveredAction,
  onDone,
}: Readonly<MarkDeliveredLayerProps>) {
  const flow = useMarkDelivered({
    workspaceId,
    projectId: target.projectId,
    actions: { markDeliveredAction },
    onDone,
  });
  return (
    <MarkDeliveredDialog
      title={target.title}
      isPending={flow.isPending}
      onClose={onDone}
      onConfirm={flow.confirm}
    />
  );
}
