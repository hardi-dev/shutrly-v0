import type { ReactNode, SyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { CatalogMutationActions } from "../use-catalog-mutations/use-catalog-mutations";

export interface CategoryDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly category?: { readonly id: string; readonly name: string };
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: CatalogMutationActions["addCategory"];
  readonly renameAction?: NonNullable<CatalogMutationActions["renameCategory"]>;
}

export interface CategoryDialogFormValues {
  readonly name: string;
}

export interface CategoryDialogFormProps {
  readonly form: UseFormReturn<CategoryDialogFormValues>;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

export interface CategoryDialogController {
  readonly form: UseFormReturn<CategoryDialogFormValues>;
  readonly isPending: boolean;
  readonly handleSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

export interface ResponsiveCategoryDialogProps extends CategoryDialogProps {
  readonly title: string;
  readonly content: ReactNode;
  readonly save: ReactNode;
  readonly isPending: boolean;
}
