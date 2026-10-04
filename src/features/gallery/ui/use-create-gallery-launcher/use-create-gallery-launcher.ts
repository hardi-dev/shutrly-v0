"use client";

import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { UseCreateGalleryLauncherInput } from "./use-create-gallery-launcher.types";

/** Fetches a server-side password proposal, then opens *Buat galeri* with it (D-5). @param input - ids and the propose action @returns the proposal (null while closed), the pending flag and handlers */
export function useCreateGalleryLauncher(input: Readonly<UseCreateGalleryLauncherInput>) {
  const [initialPassword, setInitialPassword] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const open = async () => {
    setIsOpening(true);
    try {
      setInitialPassword(await input.proposeAction(input.workspaceId, input.projectId));
    } catch {
      showToast({
        tone: "danger",
        title: GALLERY_COPY.saveFailedTitle,
        body: GALLERY_COPY.saveFailedBody,
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
