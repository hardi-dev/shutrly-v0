import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

export interface VariableChipProps {
  name: TemplateVariable;
  isRequired: boolean;
  onInsert: (name: TemplateVariable) => void;
}
