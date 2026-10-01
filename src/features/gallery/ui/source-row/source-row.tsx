import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { PROVIDER_COPY, SOURCE_COPY } from "../source-copy/source-copy.copy";
import type { PhotoSourceRowProps } from "./source-row.types";

export function PhotoSourceRow({ source, isLast }: Readonly<PhotoSourceRowProps>) {
  return (
    <ListCardItem
      icon="hard-drive"
      title={source.displayName}
      meta={PROVIDER_COPY[source.provider].title}
      isLast={isLast}
      trailing={
        <>
          <StatusChip
            tone={source.isActive ? "success" : "neutral"}
            label={source.isActive ? SOURCE_COPY.active : SOURCE_COPY.inactive}
          />
          <IconButton
            icon="more-horizontal"
            size="sm"
            aria-label={SOURCE_COPY.rowActions(source.displayName)}
          />
        </>
      }
    />
  );
}
