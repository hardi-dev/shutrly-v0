import type { ReactNode } from "react";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { PickMode } from "@/features/booking/domain/item-definition-type/item-definition-type.types";

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
  readonly pickMode: PickMode;
  readonly setPickMode: (value: PickMode) => void;
  readonly allowsPickNotes: boolean;
  readonly setAllowsPickNotes: (value: boolean) => void;
  readonly locked: boolean;
  readonly error?: string;
}

export interface ItemDefinitionValueState {
  readonly name: string;
  readonly setName: (value: string) => void;
  readonly valueType: "NUMBER" | "RANGE";
  readonly setValueType: (value: "NUMBER" | "RANGE") => void;
  readonly unit: string;
  readonly setUnit: (value: string) => void;
  readonly selectionRequired: boolean;
  readonly setSelectionRequired: (value: boolean) => void;
  readonly pickMode: PickMode;
  readonly setPickMode: (value: PickMode) => void;
  readonly allowsPickNotes: boolean;
  readonly setAllowsPickNotes: (value: boolean) => void;
  readonly reset: () => void;
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
  readonly pickMode: PickMode;
  readonly allowsPickNotes: boolean;
  readonly updateAction: ItemDefinitionDialogProps["updateAction"];
  readonly action: ItemDefinitionDialogProps["action"];
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly setError: (value: string | undefined) => void;
  readonly setPending: (value: boolean) => void;
}

export type DefinitionSelectionFieldsProps = Pick<
  ItemDefinitionFieldsProps,
  | "selectionRequired"
  | "setSelectionRequired"
  | "pickMode"
  | "setPickMode"
  | "allowsPickNotes"
  | "setAllowsPickNotes"
  | "locked"
>;

export type DefinitionTypeFieldsProps = DefinitionSelectionFieldsProps &
  Pick<ItemDefinitionFieldsProps, "valueType" | "setValueType">;
