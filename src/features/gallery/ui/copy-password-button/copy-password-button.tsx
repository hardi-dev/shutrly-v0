"use client";

import { showToast } from "@/ui/patterns/toast/toast";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { CopyPasswordButtonProps } from "./copy-password-button.types";

/** *Salin password*: copies the gallery password to the clipboard (AC-GAL-027). */
export function CopyPasswordButton({ password }: Readonly<CopyPasswordButtonProps>) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      showToast({ tone: "success", title: GALLERY_COPY.copiedTitle });
    } catch {
      showToast({
        tone: "danger",
        title: GALLERY_COPY.copyFailedTitle,
        body: GALLERY_COPY.copyFailedBody,
      });
    }
  };
  const handlePress = () => {
    void copy();
  };
  return (
    <IconButton
      icon="copy"
      size="sm"
      aria-label={GALLERY_COPY.copyPassword}
      onPress={handlePress}
    />
  );
}
