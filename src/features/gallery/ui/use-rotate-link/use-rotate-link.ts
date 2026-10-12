"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import type { ProjectAccessCardProps } from "../project-access-card/project-access-card.types";
import { USE_ROTATE_LINK_COPY_NAMESPACE } from "./use-rotate-link.copy";
import type { RotateLink } from "./use-rotate-link.types";

/**
 * *Ganti link*: the confirm, the rotation and its toast; the page refreshes with the new link
 * (AC-ACC-009).
 * @param props - the card props with the rotate action
 * @returns the dialog state and handlers
 */
export function useRotateLink(props: Readonly<ProjectAccessCardProps>): RotateLink {
  const t = useTranslations(USE_ROTATE_LINK_COPY_NAMESPACE);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  async function rotate(): Promise<void> {
    setIsPending(true);
    try {
      const result = await props.actions.rotateLinkAction(props.workspaceId, props.card.projectId);
      const title = result.ok ? t("rotatedToast") : t("cancelledToast");
      showToast({ tone: result.ok ? "success" : "danger", title });
      setIsOpen(false);
    } catch {
      showToast({ tone: "danger", title: t("failedToast") });
    } finally {
      setIsPending(false);
    }
  }
  return {
    isOpen,
    isPending,
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
    confirm: () => {
      void rotate();
    },
  };
}
