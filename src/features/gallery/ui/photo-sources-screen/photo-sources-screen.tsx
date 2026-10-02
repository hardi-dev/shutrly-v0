"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { AddSourceDialog } from "../add-source-dialog/add-source-dialog";
import { DeleteSourceDialog } from "../delete-source-dialog/delete-source-dialog";
import { RenameSourceDialog } from "../rename-source-dialog/rename-source-dialog";
import { SetupGuideCard } from "../setup-guide-card/setup-guide-card";
import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { PhotoSourceRow } from "../source-row/source-row";
import type { PhotoSourcesScreenProps } from "./photo-sources-screen.types";

// eslint-disable-next-line max-lines-per-function -- coordinates the source list, guide and dialog state
export function PhotoSourcesScreen({ workspaceId, sources, actions }: PhotoSourcesScreenProps) {
  const isMobile = useMobileViewport();
  const [dialog, setDialog] = useState<
    | { readonly kind: "add" }
    | {
        readonly kind: "rename" | "delete";
        readonly source: PhotoSourcesScreenProps["sources"][number];
      }
    | null
  >(null);

  function openAddDialog(): void {
    setDialog({ kind: "add" });
  }

  function openRenameDialog(source: PhotoSourcesScreenProps["sources"][number]): void {
    setDialog({ kind: "rename", source });
  }

  function openDeleteDialog(source: PhotoSourcesScreenProps["sources"][number]): void {
    setDialog({ kind: "delete", source });
  }

  function closeDialog(isOpen: boolean): void {
    if (!isOpen) setDialog(null);
  }

  const addButton = (
    <Button variant="secondary" iconLeading="plus" onPress={openAddDialog}>
      {SOURCE_COPY.add}
    </Button>
  );

  return (
    <main
      id="photo-sources-content"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)"
    >
      {!isMobile ? <PageActions>{addButton}</PageActions> : null}
      <SectionCard
        title={SOURCE_COPY.listTitle}
        description={isMobile ? SOURCE_COPY.listDescriptionMobile : SOURCE_COPY.listDescription}
        content="flush"
        actions={
          isMobile ? (
            <Button variant="secondary" iconLeading="plus" onPress={openAddDialog}>
              {SOURCE_COPY.addShort}
            </Button>
          ) : undefined
        }
      >
        {sources.length > 0 ? (
          <ul aria-label={SOURCE_COPY.listTitle}>
            {sources.map((source, index) => (
              <PhotoSourceRow
                key={source.id}
                source={source}
                isLast={index === sources.length - 1}
                workspaceId={workspaceId}
                actions={actions}
                onRename={openRenameDialog}
                onDelete={openDeleteDialog}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="folder-open"
            title={SOURCE_COPY.emptyTitle}
            body={SOURCE_COPY.emptyBody}
            action={addButton}
          />
        )}
      </SectionCard>
      <SetupGuideCard isMobile={isMobile} />
      {actions && dialog?.kind === "add" ? (
        <AddSourceDialog
          isOpen
          workspaceId={workspaceId}
          onOpenChange={closeDialog}
          action={actions.add}
        />
      ) : null}
      {actions && dialog?.kind === "rename" ? (
        <RenameSourceDialog
          isOpen
          workspaceId={workspaceId}
          source={dialog.source}
          onOpenChange={closeDialog}
          action={actions.rename}
        />
      ) : null}
      {actions && dialog?.kind === "delete" ? (
        <DeleteSourceDialog
          isOpen
          workspaceId={workspaceId}
          source={dialog.source}
          onOpenChange={closeDialog}
          action={actions.remove}
        />
      ) : null}
    </main>
  );
}
