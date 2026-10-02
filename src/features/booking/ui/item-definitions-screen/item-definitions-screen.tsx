"use client";
/* eslint-disable no-restricted-syntax -- dialog trigger is colocated with the item list */

import { useState } from "react";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import { definitionIcon } from "../definition-icon/definition-icon";
import { ItemDefinitionDialog } from "../item-definition-dialog/item-definition-dialog";
import type { ItemDefinitionsScreenProps } from "./item-definitions-screen.types";

function labelForType(valueType: "NUMBER" | "RANGE"): string {
  return CATALOG_COPY.valueTypes[valueType];
}
export function ItemDefinitionsScreen({
  workspaceId,
  definitions,
  addAction,
  updateAction,
}: Readonly<ItemDefinitionsScreenProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const allDefinitions = [...definitions.selection, ...definitions.other];
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="items" />
      <PageActions>
        <Button
          iconLeading="plus"
          onPress={() => {
            setEditingId(undefined);
            setIsDialogOpen(true);
          }}
        >
          {CATALOG_COPY.addItem}
        </Button>
      </PageActions>
      <DefinitionGroup
        title={CATALOG_COPY.selectionGroupTitle}
        definitions={definitions.selection}
      />
      <DefinitionGroup title={CATALOG_COPY.otherGroupTitle} definitions={definitions.other} />
      {addAction ? (
        <ItemDefinitionDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          workspaceId={workspaceId}
          definition={allDefinitions.find((item) => item.id === editingId)}
          action={addAction}
          updateAction={updateAction}
        />
      ) : null}
    </main>
  );
}
/* eslint-enable no-restricted-syntax -- end colocated dialog trigger */

function DefinitionGroup({
  title,
  definitions,
}: {
  readonly title: string;
  readonly definitions: ItemDefinitionsScreenProps["definitions"]["selection"];
}) {
  return (
    <SectionCard title={title} content="flush">
      <ul aria-label={title}>
        {definitions.map((definition, index) => (
          <ListCardItem
            key={definition.id}
            icon={definitionIcon(definition)}
            title={definition.name}
            meta={CATALOG_COPY.definitionMeta(
              labelForType(definition.valueType),
              definition.unit,
              definition.usageCount,
            )}
            isLast={index === definitions.length - 1}
            trailing={
              <span className="flex items-center gap-(--space-2)">
                {definition.selectionType ? (
                  <StatusChip
                    tone="info"
                    label={CATALOG_COPY.selectionTypes[definition.selectionType]}
                    hasDot={false}
                  />
                ) : null}
                {!definition.isActive ? (
                  <StatusChip tone="neutral" label={CATALOG_COPY.archived} hasDot={false} />
                ) : null}
              </span>
            }
          />
        ))}
      </ul>
    </SectionCard>
  );
}
