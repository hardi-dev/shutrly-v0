import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";

import type { DefinitionOption, SubmitErrors } from "../project-edit/project-edit.types";

export interface ProjectItemDialogProps {
  readonly mode: "add" | "edit";
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Add mode: the active definitions not yet in the project. */
  readonly definitions?: readonly DefinitionOption[];
  /** Edit mode: the item being changed. */
  readonly item?: {
    readonly name: string;
    readonly unit: string | null;
    readonly valueType: "NUMBER" | "RANGE";
    readonly selectionRequired: boolean;
    readonly value: PackageValue;
  };
  /** Returns the field errors to show, or null to close; the dialog calls no action itself. */
  readonly onSubmit: (input: {
    readonly definitionId?: string;
    readonly value: PackageValue;
  }) => Promise<SubmitErrors>;
}
