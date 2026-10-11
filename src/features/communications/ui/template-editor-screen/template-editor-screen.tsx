"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useController } from "react-hook-form";

import {
  TEMPLATE_CONTENT_MAX_LENGTH,
  templateContentLength,
} from "@/features/communications/domain/template-content/template-content";
import {
  allowedVariables,
  requiredVariable,
} from "@/features/communications/domain/variable-catalogue/variable-catalogue";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { MessagePreview } from "../message-preview/message-preview";
import { previewHasPasswordNote, renderPreview } from "../message-preview/render-preview";
import { TEMPLATE_LABEL_MESSAGE_KEY } from "../template-copy/template-copy.copy";
import { templateProblemText } from "../template-problem-text/template-problem-text";
import { UnsavedChangesDialog } from "../unsaved-changes-dialog/unsaved-changes-dialog";
import { useTemplateForm } from "../use-template-form/use-template-form";
import { useUnsavedChangesGuard } from "../use-unsaved-changes-guard/use-unsaved-changes-guard";
import { VariableChip } from "../variable-chip/variable-chip";
import { TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE } from "./template-editor-screen.copy";
import type {
  EditorLayoutProps,
  EditorPartProps,
  TemplateEditorScreenProps,
} from "./template-editor-screen.types";

/**
 * Template editor v3: content and variables beside a live preview on desktop; one card with
 * Edit/Preview tabs on phones; save and restore below; toasts for saved and failed saves.
 * @param props - the editor data and the bound save action
 * @returns the editor form
 */
export function TemplateEditorScreen({ editor, action }: Readonly<TemplateEditorScreenProps>) {
  const t = useTranslations(TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE);
  const label = t(TEMPLATE_LABEL_MESSAGE_KEY[editor.type]);
  const isMobile = useMobileViewport();
  const handleSaved = () => {
    showToast({
      tone: "success",
      title: t("savedTitle"),
      body: t("savedBody", { templateName: label }),
    });
  };
  const handleFailed = (retry: () => void) => {
    showToast({
      tone: "danger",
      title: t("serverErrorTitle"),
      body: t("serverErrorBody"),
      action: { label: t("retry"), onAction: retry },
    });
  };
  const template = useTemplateForm({
    ...editor,
    action,
    onSaved: handleSaved,
    onFailed: handleFailed,
  });
  const guard = useUnsavedChangesGuard(template.isDirty);
  const preview = renderPreview(editor.type, template.content, editor.brandName);
  const parts = { template, type: editor.type, isMobile, preview };
  return (
    <form
      noValidate
      onSubmit={template.onSubmit}
      className="flex flex-col gap-(--space-6) md:flex-row md:items-start md:gap-(--component-panel-app-content-gap)"
    >
      {isMobile ? <MobileEditor {...parts} /> : <DesktopEditor {...parts} />}
      <UnsavedChangesDialog
        isOpen={guard.isConfirmOpen}
        isMobile={isMobile}
        templateLabel={label}
        onStay={guard.stay}
        onLeave={guard.leave}
      />
    </form>
  );
}

function DesktopEditor({ preview, ...part }: Readonly<EditorLayoutProps>) {
  const t = useTranslations(TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE);
  return (
    <>
      {/* 5:3 split ≈ the 664/400 columns; no width token exists (D-M3). */}
      <div className="flex min-w-0 flex-[5_1_0%] flex-col gap-(--component-panel-app-content-gap)">
        <SectionCard title={t("contentTitle")} description={t("contentDescription")}>
          <ContentField {...part} />
          <VariableList {...part} />
        </SectionCard>
        <EditorActions {...part} />
      </div>
      <SectionCard
        title={t("preview")}
        description={t("previewDescription")}
        className="min-w-0 flex-[3_1_0%]"
      >
        <MessagePreview text={preview} showsPasswordNote={previewHasPasswordNote(part.type)} />
      </SectionCard>
    </>
  );
}

function MobileEditor({ preview, ...part }: Readonly<EditorLayoutProps>) {
  const t = useTranslations(TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE);
  const [view, setView] = useState("edit");
  const views = [
    { id: "edit", label: t("edit") },
    { id: "preview", label: t("preview") },
  ];
  return (
    <>
      <SectionCard
        title={t("mobileTitle")}
        actions={
          <SegmentedControl
            label={t("viewLabel")}
            options={views}
            selectedId={view}
            onChange={setView}
          />
        }
      >
        {view === "edit" ? (
          <>
            <ContentField {...part} />
            <VariableList {...part} />
          </>
        ) : (
          <MessagePreview text={preview} showsPasswordNote={previewHasPasswordNote(part.type)} />
        )}
      </SectionCard>
      {view === "edit" ? <EditorActions {...part} /> : null}
    </>
  );
}

function ContentField({ template, type, isMobile }: Readonly<EditorPartProps>) {
  const t = useTranslations(TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE);
  const { field, fieldState } = useController({ control: template.form.control, name: "content" });
  const setRef = (element: HTMLTextAreaElement | null) => {
    field.ref(element);
    template.setTextarea(element);
  };
  return (
    <Textarea
      aria-label={t("contentLabel")}
      name={field.name}
      // 13 / 12 lines of 21 px ≈ the 300 / 280 px textarea in v8MaG / byw9B (D-M4).
      rows={isMobile ? 13 : 12}
      value={field.value}
      onChange={field.onChange}
      textareaRef={setRef}
      helperText={isMobile ? t("mobileHelper") : t("helper")}
      errorMessage={templateProblemText(t, type, fieldState.error?.message)}
      trailingMeta={t("counter", {
        length: templateContentLength(field.value),
        max: TEMPLATE_CONTENT_MAX_LENGTH,
      })}
    />
  );
}

function VariableList({ template, type, isMobile }: Readonly<EditorPartProps>) {
  const t = useTranslations(TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE);
  const required = requiredVariable(type);
  return (
    <div className="flex flex-col gap-(--space-2)">
      <p className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {t("variablesTitle")}
      </p>
      <div className="flex flex-wrap gap-(--space-2)">
        {allowedVariables(type).map((name) => (
          <VariableChip
            key={name}
            name={name}
            isRequired={name === required}
            onInsert={template.insertVariable}
          />
        ))}
      </div>
      <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
        {isMobile ? t("mobileVariablesHint") : t("variablesHint")}
      </p>
    </div>
  );
}

function EditorActions({ template, isMobile }: Readonly<EditorPartProps>) {
  const t = useTranslations(TEMPLATE_EDITOR_SCREEN_COPY_NAMESPACE);
  const size = isMobile ? "lg" : "md";
  const save = (
    <Button
      type="submit"
      size={size}
      isDisabled={!template.isDirty || template.isSubmitting}
      isPending={template.isSubmitting}
      className={isMobile ? "w-full" : undefined}
    >
      {template.isSubmitting ? t("saving") : t("save")}
    </Button>
  );
  const restore = (
    <Button
      variant="secondary"
      size={size}
      iconLeading="rotate-ccw"
      isDisabled={template.isSubmitting}
      onPress={template.restoreDefault}
      className={isMobile ? "w-full" : undefined}
    >
      {t("restore")}
    </Button>
  );
  return isMobile ? (
    <div className="flex flex-col gap-(--space-3)">
      {save}
      {restore}
    </div>
  ) : (
    <div className="flex items-center justify-between">
      {restore}
      {save}
    </div>
  );
}
