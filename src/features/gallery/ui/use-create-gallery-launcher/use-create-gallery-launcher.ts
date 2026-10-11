"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { USE_CREATE_GALLERY_LAUNCHER_COPY_NAMESPACE } from "./use-create-gallery-launcher.copy";
import type { UseCreateGalleryLauncherInput } from "./use-create-gallery-launcher.types";

/** Fetches a server-side password proposal, then opens *Buat galeri* with it (D-5). @param input - ids and the propose action @returns the proposal (null while closed), the pending flag and handlers */
export function useCreateGalleryLauncher(input: Readonly<UseCreateGalleryLauncherInput>) {
  const t = useTranslations(USE_CREATE_GALLERY_LAUNCHER_COPY_NAMESPACE);
  const [initialPassword, setInitialPassword] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const open = async () => {
    setIsOpening(true);
    try {
      setInitialPassword(await input.proposeAction(input.workspaceId, input.projectId));
    } catch {
      showToast({
        tone: "danger",
        title: t("saveFailedTitle"),
        body: t("saveFailedBody"),
      });
    } finally {
      setIsOpening(false);
    }
  };
  const handleOpen = () => {
    void open();
  };
  const close = () => {
    setInitialPassword(null);
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) close();
  };
  return { initialPassword, isOpening, handleOpen, handleOpenChange, close };
}
