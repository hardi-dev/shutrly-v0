"use client";

import { useTranslations } from "next-intl";

import { showToast } from "@/ui/patterns/toast/toast";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { COPY_PASSWORD_BUTTON_COPY_NAMESPACE } from "./copy-password-button.copy";
import type { CopyPasswordButtonProps } from "./copy-password-button.types";

/** *Salin password*: copies the gallery password to the clipboard (AC-GAL-027). */
export function CopyPasswordButton({ password }: Readonly<CopyPasswordButtonProps>) {
  const t = useTranslations(COPY_PASSWORD_BUTTON_COPY_NAMESPACE);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      showToast({ tone: "success", title: t("copiedTitle") });
    } catch {
      showToast({
        tone: "danger",
        title: t("copyFailedTitle"),
        body: t("copyFailedBody"),
      });
    }
  };
  const handlePress = () => {
    void copy();
  };
  return <IconButton icon="copy" size="sm" aria-label={t("copyPassword")} onPress={handlePress} />;
}
