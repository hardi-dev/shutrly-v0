import type { DefinitionType } from "../item-definition-type/item-definition-type.types";

/** D-18: the stable identity of a platform-default item (migration 0021 CHECK list). */
export type DefaultItemKey = "EDITED_PHOTOS" | "PRINTED_PHOTOS" | "PEOPLE_COUNT" | "SHOOT_DURATION";

export interface DefaultItemDefinition extends DefinitionType {
  readonly name: string;
  readonly unit: string | null;
  readonly defaultKey: DefaultItemKey;
}
