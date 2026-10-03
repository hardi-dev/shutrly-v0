"use client";
/* eslint-disable max-lines-per-function -- the host owns one dialog state for every menu action */

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import { buildProjectMenu } from "@/features/booking/domain/project-menu/project-menu";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientDialog } from "../client-dialog/client-dialog";
import { ProjectInfoDialog } from "../project-info-dialog/project-info-dialog";
import { ProjectMenu } from "../project-menu/project-menu";
import { CancelProjectDialog } from "../project-status-dialogs/cancel-project-dialog";
import { DeleteDraftDialog } from "../project-status-dialogs/delete-draft-dialog";
import { useClientMutations } from "../use-client-mutations/use-client-mutations";
import { useProjectActions } from "../use-project-actions/use-project-actions";
import type {
  OpenDialog,
  ProjectMenuHostProps,
  ProjectMenuTarget,
} from "./project-menu-host.types";

/** Owns the ⋯ menus and the dialogs they open, so list rows and the detail page behave the same (AC-PRJ-022, 023, 027). */
export function ProjectMenuHost(props: Readonly<ProjectMenuHostProps>) {
  const router = useRouter();
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const mutations = useClientMutations();
  const steps = useProjectActions({
    workspaceId: props.workspaceId,
    projectId: "",
    advanceAction: props.actions.advanceAction,
    onSessionRequired: props.onSessionRequired,
  });
  const refresh = () => {
    router.refresh();
  };
  const close = (isOpen: boolean) => {
    if (!isOpen) setDialog(null);
  };
  const openInfo = async (target: ProjectMenuTarget) => {
    if (target.info) {
      setDialog({ kind: "info", info: target.info });
      return;
    }
    const detail = await props.actions.loadDetailAction(props.workspaceId, target.id);
    setDialog({
      kind: "info",
      info: {
        projectId: detail.id,
        title: detail.title,
        notes: detail.notes,
        agreedPrice: detail.agreedPrice,
        basePrice: detail.service.basePrice,
        canEditDeal: detail.canEditDeal,
      },
    });
  };
  const openNumber = async (target: ProjectMenuTarget) => {
    const found = await props.actions.loadClientAction(props.workspaceId, target.clientId);
    setDialog({ kind: "number", client: found });
  };
  const submitNumber = async (workspaceId: string, values: ClientInput) => {
    if (dialog?.kind !== "number") return undefined;
    const clientId = dialog.client.id;
    const result = await mutations.run(
      values.name,
      () => props.actions.updateClientAction(workspaceId, clientId, values),
      { title: CLIENT_COPY.savedTitle },
    );
    if (result?.ok !== false) refresh();
    return result;
  };
  const menuFor = (target: ProjectMenuTarget) => (
    <ProjectMenu
      title={target.title}
      meta={target.meta}
      variant={props.variant}
      whatsappNumber={target.whatsappNumber}
      groups={buildProjectMenu({
        status: target.status,
        hasWhatsappNumber: target.whatsappNumber !== null,
      })}
      handlers={{
        onStep: (step) => void steps.advance(step, target.id),
        onEditInfo: () => void openInfo(target),
        onCancel: () => {
          setDialog({ kind: "cancel", target });
        },
        onDeleteDraft: () => {
          setDialog({ kind: "delete", target });
        },
        onAddNumber: () => void openNumber(target),
      }}
    />
  );
  return (
    <>
      {props.children({
        menuFor,
        openInfo: (target) => {
          void openInfo(target);
        },
      })}
      <CancelProjectDialog
        workspaceId={props.workspaceId}
        target={dialog?.kind === "cancel" ? dialog.target : null}
        cancelAction={props.actions.cancelAction}
        onOpenChange={close}
        onDone={refresh}
      />
      <DeleteDraftDialog
        workspaceId={props.workspaceId}
        target={dialog?.kind === "delete" ? dialog.target : null}
        deleteAction={props.actions.deleteDraftAction}
        onOpenChange={close}
        onDone={props.onDeleted}
      />
      <ProjectInfoDialog
        isOpen={dialog?.kind === "info"}
        onOpenChange={close}
        workspaceId={props.workspaceId}
        target={dialog?.kind === "info" ? dialog.info : null}
        updateAction={props.actions.updateInfoAction}
        onSaved={refresh}
      />
      {dialog?.kind === "number" ? (
        <ClientDialog
          isOpen
          mode="edit"
          client={dialog.client}
          workspaceId={props.workspaceId}
          onOpenChange={close}
          onSubmit={submitNumber}
        />
      ) : null}
    </>
  );
}
/* eslint-enable max-lines-per-function -- the host owns one dialog state for every menu action */
