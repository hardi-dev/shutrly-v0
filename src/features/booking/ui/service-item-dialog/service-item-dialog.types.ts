import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { ServiceItemRecord } from "@/features/booking/application/ports/service-repository/service-repository.port";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";

export interface ServiceItemDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly serviceId: string;
  readonly definitions: readonly ItemDefinitionRecord[];
  readonly items: readonly ServiceItemRecord[];
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (
    workspaceId: string,
    serviceId: string,
    values: { readonly definitionId: string; readonly value: unknown },
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
}

export interface ResponsiveItemDialogProps extends ServiceItemDialogProps {
  readonly content: ReactNode;
  readonly save: ReactNode;
}

export interface ServiceItemSubmitArgs {
  readonly workspaceId: string;
  readonly serviceId: string;
  readonly definitionId: string | null;
  readonly definitions: readonly ItemDefinitionRecord[];
  readonly value: string;
  readonly minimum: string;
  readonly maximum: string;
  readonly action: ServiceItemDialogProps["action"];
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly setError: (value: string | undefined) => void;
  readonly setPending: (value: boolean) => void;
}
import type { ReactNode } from "react";
