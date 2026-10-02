import type { DefinitionType } from "../item-definition-type/item-definition-type.types";

export interface DefaultItemDefinition extends DefinitionType {
  readonly name: string;
  readonly unit: string | null;
}
