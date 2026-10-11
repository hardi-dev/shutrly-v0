"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { USE_LOCK_SELECTION_COPY_NAMESPACE } from "./use-lock-selection.copy";
import type {
  LockSelectionHandle,
  LockTarget,
  UseLockSelectionInput,
} from "./use-lock-selection.types";

/**
 * Drives *Kunci pilihan* and *Tutup pilihan*: a confirm first, then the lock action; success shows a
 * toast and re-renders the page, a group that changed meanwhile says so and re-renders (D-13,
 * AC-SEL-011).
 * @param input - workspace, project and the lock action
 * @returns the confirm state and handlers
 */
export function useLockSelection({
  workspaceId,
  projectId,
  lockAction,
}: UseLockSelectionInput): LockSelectionHandle {
  const t = useTranslations(USE_LOCK_SELECTION_COPY_NAMESPACE);
  const router = useRouter();
  const [target, setTarget] = useState<LockTarget | null>(null);
  const [isPending, setIsPending] = useState(false);
  const request = (next: LockTarget) => {
    setTarget(next);
  };
  const close = () => {
    setTarget(null);
  };
  const run = async (current: LockTarget) => {
    setIsPending(true);
    const result = await lockAction(workspaceId, projectId, {
      groupId: current.group.id,
      intent: current.intent,
    }).catch(() => null);
    setIsPending(false);
    setTarget(null);
    if (result === null || (!result.ok && result.code === "INVALID")) {
      showToast({ tone: "danger", title: t("lockFailed") });
      return;
    }
    if (result.ok) {
      const title =
        current.intent === "LOCK"
          ? t("lockedToast", { name: result.groupName })
          : t("closedToast", { name: result.groupName });
      showToast({ tone: "success", title });
    } else showToast({ tone: "warning", title: t("staleToast") });
    router.refresh();
  };
  const confirm = () => {
    if (target) void run(target);
  };
  return { target, isPending, request, confirm, close };
}
