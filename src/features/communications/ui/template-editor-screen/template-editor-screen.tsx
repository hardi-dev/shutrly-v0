"use client";

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
import { TEMPLATE_COPY } from "../template-copy/template-copy.copy";
import { templateProblemText } from "../template-problem-text/template-problem-text";
import { UnsavedChangesDialog } from "../unsaved-changes-dialog/unsaved-changes-dialog";
import { useTemplateForm } from "../use-template-form/use-template-form";
import { useUnsavedChangesGuard } from "../use-unsaved-changes-guard/use-unsaved-changes-guard";
import { VariableChip } from "../variable-chip/variable-chip";
import { TEMPLATE_EDITOR_COPY as COPY } from "./template-editor-screen.copy";
import type {
  EditorLayoutProps,
  EditorPartProps,
  TemplateEditorScreenProps,
} from "./template-editor-screen.types";

const VIEWS = [
  { id: "edit", label: COPY.edit },
  { id: "preview", label: COPY.preview },
];

/**
 * Template editor v3: content and variables beside a live preview on desktop; one card with
 * Edit/Pratinjau tabs on phones; save and restore below; toasts for saved and failed saves.
 * @param props - the editor data and the bound save action
 * @returns the editor form
 */
export function TemplateEditorScreen({ editor, action }: Readonly<TemplateEditorScreenProps>) {
  const label = TEMPLATE_COPY[editor.type].label;
  const isMobile = useMobileViewport();
  const handleSaved = () => {
    showToast({ tone: "success", title: COPY.saved, body: COPY.savedBody(label) });
  };
  const handleFailed = (retry: () => void) => {
    showToast({
      tone: "danger",
      title: COPY.serverErrorTitle,
      body: COPY.serverErrorBody,
      action: { label: COPY.retry, onAction: retry },
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
  return (
    <>
      {/* 5:3 split ≈ the 664/400 columns; no width token exists (D-M3). */}
      <div className="flex min-w-0 flex-[5_1_0%] flex-col gap-(--component-panel-app-content-gap)">
        <SectionCard title={COPY.contentTitle} description={COPY.contentDescription}>
          <ContentField {...part} />
          <VariableList {...part} />
        </SectionCard>
        <EditorActions {...part} />
      </div>
      <SectionCard
        title={COPY.previewTitle}
        description={COPY.previewDescription}
        className="min-w-0 flex-[3_1_0%]"
      >
        <MessagePreview text={preview} showsPasswordNote={previewHasPasswordNote(part.type)} />
      </SectionCard>
    </>
  );
}

function MobileEditor({ preview, ...part }: Readonly<EditorLayoutProps>) {
  const [view, setView] = useState("edit");
  return (
    <>
      <SectionCard
        title={COPY.mobileTitle}
        actions={
          <SegmentedControl
            label={COPY.viewLabel}
            options={VIEWS}
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
  const { field, fieldState } = useController({ control: template.form.control, name: "content" });
  const setRef = (element: HTMLTextAreaElement | null) => {
    field.ref(element);
    template.setTextarea(element);
  };
  return (
    <Textarea
      label={COPY.contentLabel}
      isLabelHidden
      name={field.name}
      rows={isMobile ? 8 : 10}
      value={field.value}
      onChange={field.onChange}
      textareaRef={setRef}
      helperText={isMobile ? COPY.mobileHelper : COPY.helper}
      errorMessage={templateProblemText(type, fieldState.error?.message)}
      trailingMeta={COPY.counter(templateContentLength(field.value), TEMPLATE_CONTENT_MAX_LENGTH)}
    />
  );
}

function VariableList({ template, type, isMobile }: Readonly<EditorPartProps>) {
  const required = requiredVariable(type);
  return (
    <div className="flex flex-col gap-(--space-2)">
      <p className="text-(length:--font-size-label) text-(--component-input-label)">
        {COPY.variablesTitle}
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
        {isMobile ? COPY.mobileVariablesHint : COPY.variablesHint}
      </p>
    </div>
  );
}

function EditorActions({ template, isMobile }: Readonly<EditorPartProps>) {
  const size = isMobile ? "lg" : "md";
  const save = (
    <Button
      type="submit"
      size={size}
      isDisabled={!template.isDirty || template.isSubmitting}
      isPending={template.isSubmitting}
      className={isMobile ? "w-full" : undefined}
    >
      {template.isSubmitting ? COPY.saving : COPY.save}
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
      {COPY.restore}
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
