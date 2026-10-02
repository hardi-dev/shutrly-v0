import type { ReactNode } from "react";

import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ServiceDetailView } from "@/features/booking/application/use-cases/service-results/service-results.types";
import type { ServiceWriteResult } from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface AddServiceDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly categories: readonly CategoryRecord[];
  readonly service?: Pick<ServiceDetailView, "id" | "name" | "categoryId" | "basePrice">;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, values: unknown) => Promise<ServiceWriteResult>;
  readonly updateAction?: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<ServiceWriteResult | undefined>;
}

export interface AddServiceFieldsProps {
  readonly categories: readonly CategoryRecord[];
  readonly name: string;
  readonly onNameChange: (value: string) => void;
  readonly categoryId: string | null;
  readonly onCategoryChange: (value: string) => void;
  readonly basePrice: string;
  readonly onBasePriceChange: (value: string) => void;
  readonly error?: string;
}

export interface ResponsiveServiceDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onClose: () => void;
  readonly content: ReactNode;
  readonly save: ReactNode;
  readonly title: string;
  readonly description: string;
}

export interface AddServiceSubmitArgs {
  readonly workspaceId: string;
  readonly service: AddServiceDialogProps["service"];
  readonly action: AddServiceDialogProps["action"];
  readonly updateAction: AddServiceDialogProps["updateAction"];
  readonly name: string;
  readonly categoryId: string | null;
  readonly basePrice: string;
  readonly close: () => void;
  readonly setError: (error: string | undefined) => void;
  readonly setPending: (pending: boolean) => void;
  readonly push: (path: string) => void;
}
