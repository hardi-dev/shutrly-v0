import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { ServiceItemRecord } from "@/features/booking/application/ports/service-repository/service-repository.port";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";

export interface ServiceItemDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly serviceId: string;
  readonly definitions: readonly ItemDefinitionRecord[];
  readonly items: readonly ServiceItemRecord[];
  readonly item?: ServiceItemRecord;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    serviceId: string,
    values: { readonly definitionId: string; readonly value: unknown },
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateAction?: (
    workspaceId: string,
    serviceId: string,
    itemId: string,
    values: { readonly value: unknown },
  ) => Promise<CatalogWriteResult | undefined>;
}

export interface ServiceItemFieldsProps {
  readonly definitions: readonly ItemDefinitionRecord[];
  readonly definitionId: string | null;
  readonly setDefinitionId: (value: string) => void;
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly minimum: string;
  readonly setMinimum: (value: string) => void;
  readonly maximum: string;
  readonly setMaximum: (value: string) => void;
  readonly error?: string;
  readonly used: ReadonlySet<string>;
  readonly isEditing: boolean;
}

export interface ResponsiveItemDialogProps extends ServiceItemDialogProps {
  readonly content: ReactNode;
  readonly save: ReactNode;
  readonly title: string;
  readonly description: string;
}

export interface ServiceItemSubmitArgs {
  readonly workspaceId: string;
  readonly serviceId: string;
  readonly definitionId: string | null;
  readonly item?: ServiceItemRecord;
  readonly definitions: readonly ItemDefinitionRecord[];
  readonly value: string;
  readonly minimum: string;
  readonly maximum: string;
  readonly action: ServiceItemDialogProps["action"];
  readonly updateAction: ServiceItemDialogProps["updateAction"];
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly setError: (value: string | undefined) => void;
  readonly setPending: (value: boolean) => void;
}

export interface ServiceItemValueState {
  readonly definitionId: string | null;
  readonly setDefinitionId: (value: string | null) => void;
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly minimum: string;
  readonly setMinimum: (value: string) => void;
  readonly maximum: string;
  readonly setMaximum: (value: string) => void;
}
import type { ReactNode } from "react";
