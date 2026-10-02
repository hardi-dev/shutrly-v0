import type { DefinitionType } from "@/features/booking/domain/item-definition-type/item-definition-type.types";
import type { IconName } from "@/ui/primitives/icon/icon.types";

export function definitionIcon(definition: DefinitionType): IconName {
  if (definition.selectionType === "EDIT") return "image";
  if (definition.selectionType === "PRINT") return "printer";
  if (definition.valueType === "RANGE") return "move-horizontal";
  return "hash";
}
