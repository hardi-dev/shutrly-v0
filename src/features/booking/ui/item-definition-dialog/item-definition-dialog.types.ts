import type { ReactNode } from "react";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";

export interface ItemDefinitionDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly definition?: ItemDefinitionRecord;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateAction?: (
    workspaceId: string,
    id: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
}

export interface ItemDefinitionFieldsProps {
  readonly name: string;
  readonly setName: (value: string) => void;
  readonly valueType: "NUMBER" | "RANGE";
  readonly setValueType: (value: "NUMBER" | "RANGE") => void;
  readonly unit: string;
  readonly setUnit: (value: string) => void;
  readonly selectionRequired: boolean;
  readonly setSelectionRequired: (value: boolean) => void;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly setSelectionType: (value: "EDIT" | "PRINT") => void;
  readonly locked: boolean;
  readonly error?: string;
}

export interface ResponsiveItemDefinitionDialogProps extends ItemDefinitionDialogProps {
  readonly title: string;
  readonly content: ReactNode;
  readonly save: ReactNode;
}

export interface ItemDefinitionSubmitArgs {
  readonly workspaceId: string;
  readonly definition?: ItemDefinitionRecord;
  readonly name: string;
  readonly valueType: "NUMBER" | "RANGE";
  readonly unit: string;
  readonly selectionRequired: boolean;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly updateAction: ItemDefinitionDialogProps["updateAction"];
  readonly action: ItemDefinitionDialogProps["action"];
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly setError: (value: string | undefined) => void;
  readonly setPending: (value: boolean) => void;
}
