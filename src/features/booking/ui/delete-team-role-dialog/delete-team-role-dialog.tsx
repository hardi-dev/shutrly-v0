"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { DELETE_TEAM_ROLE_DIALOG_COPY_NAMESPACE } from "./delete-team-role-dialog.copy";
import type { DeleteRoleView, DeleteTeamRoleDialogProps } from "./delete-team-role-dialog.types";

/**
 * Confirms a role delete, or explains why it is blocked while members or assignments use it.
 * @param props - the role to delete and the server action
 * @returns the dialog, or nothing when no role is selected
 */
export function DeleteTeamRoleDialog({ role, ...rest }: Readonly<DeleteTeamRoleDialogProps>) {
  if (!role) return null;
  return <DeleteRoleBody key={role.id} role={role} {...rest} />;
}

function DeleteRoleBody({
  role,
  workspaceId,
  onOpenChange,
  action,
}: Readonly<Omit<DeleteTeamRoleDialogProps, "role"> & { readonly role: TeamRoleRecord }>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  // The table already shows the usage, so a used role opens blocked; the server re-checks.
  const t = useTranslations(DELETE_TEAM_ROLE_DIALOG_COPY_NAMESPACE);
  const [usage, setUsage] = useState(role.usage);
  const isBlocked = usage > 0;

  async function confirm(): Promise<void> {
    setIsPending(true);
    try {
      const result = await action(workspaceId, role.id);
      if (!result.ok) {
        setUsage(result.usage);
        return;
      }
      showToast({ tone: "success", title: t("roleDeletedTitle") });
      onOpenChange(false);
    } catch {
      showToast({ tone: "danger", title: t("serverErrorTitle") });
    } finally {
      setIsPending(false);
    }
  }
  function close(): void {
    onOpenChange(false);
  }
  function handleConfirm(): void {
    void confirm();
  }
  const view: DeleteRoleView = {
    title: isBlocked
      ? t("roleDeleteBlockedTitle", { name: role.name })
      : t("roleDeleteTitle", { name: role.name }),
    description: isBlocked ? t("roleDeleteBlockedBody", { count: usage }) : t("roleDeleteBody"),
    isBlocked,
    isPending,
    close,
    confirm: handleConfirm,
  };
  return isMobile ? (
    <DeleteRoleSheet view={view} onOpenChange={onOpenChange} />
  ) : (
    <DeleteRoleModal view={view} onOpenChange={onOpenChange} />
  );
}

function DeleteRoleSheet({
  view,
  onOpenChange,
}: Readonly<{ view: DeleteRoleView; onOpenChange: (isOpen: boolean) => void }>) {
  const t = useTranslations(DELETE_TEAM_ROLE_DIALOG_COPY_NAMESPACE);
  return (
    <BottomSheet
      isOpen
      onOpenChange={onOpenChange}
      title={view.title}
      description={view.description}
      variant="actions"
    >
      {view.isBlocked ? null : (
        <SheetItem
          label={view.isPending ? t("deleting") : t("delete")}
          icon="trash-2"
          variant="destructive"
          isPending={view.isPending}
          onPress={view.confirm}
        />
      )}
      <SheetItem
        label={view.isBlocked ? t("close") : t("cancel")}
        isDisabled={view.isPending}
        onPress={view.close}
      />
    </BottomSheet>
  );
}

function DeleteRoleModal({
  view,
  onOpenChange,
}: Readonly<{ view: DeleteRoleView; onOpenChange: (isOpen: boolean) => void }>) {
  const t = useTranslations(DELETE_TEAM_ROLE_DIALOG_COPY_NAMESPACE);
  return (
    <Modal
      isOpen
      onOpenChange={onOpenChange}
      title={view.title}
      description={view.description}
      size="sm"
      isDestructive={!view.isBlocked}
      actions={
        <>
          <Button variant="secondary" onPress={view.close} isDisabled={view.isPending}>
            {view.isBlocked ? t("close") : t("cancel")}
          </Button>
          {view.isBlocked ? null : (
            <Button variant="danger" onPress={view.confirm} isPending={view.isPending}>
              {t("delete")}
            </Button>
          )}
        </>
      }
    >
      {null}
    </Modal>
  );
}
