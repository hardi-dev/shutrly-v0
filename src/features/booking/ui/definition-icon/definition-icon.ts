import type { DefinitionType } from "@/features/booking/domain/item-definition-type/item-definition-type.types";
import type { IconName } from "@/ui/primitives/icon/icon.types";

export function definitionIcon(definition: DefinitionType): IconName {
  if (definition.pickMode === "COUNT") return "images";
  if (definition.pickMode === "QUANTITY") return "layers";
  if (definition.valueType === "RANGE") return "move-horizontal";
  return "hash";
}
