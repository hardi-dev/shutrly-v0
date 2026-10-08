import type { ReactNode } from "react";
import type { Control } from "react-hook-form";

import type { AddOnGroupFacts } from "@/features/booking/application/ports/add-on-target/add-on-target.port";
import type { CreateAddOnInput } from "@/features/booking/application/use-cases/create-add-on/create-add-on.types";

import type { AddOnCardActions } from "../add-on-card/add-on-card.types";

export interface AddOnDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly targets: readonly AddOnGroupFacts[];
  readonly createAction: AddOnCardActions["createAction"];
}

export interface AddOnDialogActionsProps {
  readonly save: ReactNode;
  readonly isPending: boolean;
  readonly onCancel: (isOpen: boolean) => void;
}

export interface AddOnFieldsProps {
  readonly control: Control<CreateAddOnInput>;
  readonly targets: readonly AddOnGroupFacts[];
}

export interface AddOnTextInputProps {
  readonly control: Control<CreateAddOnInput>;
  readonly name: "description" | "quantity" | "unitPrice";
  readonly label: string;
  readonly placeholder?: string;
  readonly description?: string;
  readonly prefix?: string;
}
