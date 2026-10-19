"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { GALLERY_SHARE_DIALOG_COPY_NAMESPACE } from "./gallery-share-dialog.copy";
import type { GalleryShareBodyProps, GalleryShareReadyProps } from "./gallery-share-dialog.types";

const LABEL = "text-(length:--font-size-caption) text-(--color-semantic-text-muted)";
const VALUE = "text-(length:--font-size-body) text-(--color-semantic-text-primary)";
const NOTE = "text-(length:--font-size-caption) text-(--color-semantic-text-muted)";
const PREVIEW =
  "flex w-full min-w-0 flex-col rounded-(--radius-md) bg-(--color-semantic-surface-subtle) p-(--space-4)";
const BUBBLE = cn(
  "flex w-full min-w-0 flex-col rounded-(--radius-md) bg-(--color-semantic-surface-panel)",
  "border border-(--color-semantic-border-subtle) p-(--space-3) break-words whitespace-pre-line",
  "text-(length:--font-size-body) leading-[21px] text-(--color-semantic-text-primary)",
);

/** The recipient row and the rendered message (K1, K2); the state's first line says "preparing" while loading. @param props - the state, the workspace and *Tambah nomor WhatsApp* @returns the dialog body */
export function GalleryShareBody({
  state,
  workspaceId,
  onAddNumber,
}: Readonly<GalleryShareBodyProps>) {
  const t = useTranslations(GALLERY_SHARE_DIALOG_COPY_NAMESPACE);
  if (state.status === "loading") return <p className={NOTE}>{t("loading")}</p>;
  if (state.status === "error") {
    return <Alert tone="danger" live title={t("errorTitle")} body={t("errorBody")} />;
  }
  return <ReadyBody message={state.message} workspaceId={workspaceId} onAddNumber={onAddNumber} />;
}

function ReadyBody({ message, workspaceId, onAddNumber }: Readonly<GalleryShareReadyProps>) {
  const t = useTranslations(GALLERY_SHARE_DIALOG_COPY_NAMESPACE);
  const { name, phone } = message.recipient;
  const hasNumber = phone !== null;
  return (
    <div className="flex flex-col gap-(--space-4)">
      {hasNumber ? null : (
        <Alert
          tone="warning"
          title={t("noNumberTitle", { name })}
          body={t("noNumberBody")}
          action={{ label: t("addNumber"), onAction: onAddNumber }}
        />
      )}
      <div className="flex flex-col gap-(--space-1)">
        <span className={LABEL}>{t("recipientLabel")}</span>
        <span className={VALUE}>
          {hasNumber ? t("recipientValue", { name, phone }) : t("recipientNoNumber", { name })}
        </span>
      </div>
      <div className={PREVIEW}>
        <div className={BUBBLE}>{message.text}</div>
      </div>
      <p className={NOTE}>{t("passwordNote")}</p>
      <div className="flex flex-col gap-(--space-2) md:flex-row md:flex-wrap">
        <Button
          variant="secondary"
          iconLeading="pencil"
          href={`/w/${workspaceId}/message-templates/gallery-share`}
          className="w-full md:w-auto"
        >
          {t("editTemplate")}
        </Button>
      </div>
    </div>
  );
}
