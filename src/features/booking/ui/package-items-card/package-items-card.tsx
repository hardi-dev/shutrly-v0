import { summariseServiceItems } from "@/features/booking/domain/item-summary/item-summary";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectRowMenu } from "../project-row-menu/project-row-menu";
import type { RowMenuEntry } from "../project-row-menu/project-row-menu.types";
import type {
  PackageCardEdit,
  PackageCardItem,
  PackageItemsCardProps,
} from "./package-items-card.types";

/** Lists the package items copied from the service; editing them arrives with F-07 Slice 7. */
export function PackageItemsCard({
  serviceName,
  items,
  isMobile,
  description,
  edit,
}: Readonly<PackageItemsCardProps>) {
  const locale = useFormattingLocale();
  return (
    <SectionCard
      title={PROJECT_COPY.packageTitle}
      description={
        description ??
        (isMobile
          ? PROJECT_COPY.packageDescriptionMobile(serviceName)
          : PROJECT_COPY.packageDescriptionDesktop(serviceName))
      }
      content="flush"
      actions={
        edit ? (
          <Button variant="secondary" iconLeading="plus" onPress={edit.onAdd}>
            {isMobile ? PROJECT_COPY.addItemMobile : PROJECT_COPY.addItemDesktop}
          </Button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon="package"
          placement="in-card"
          title={PROJECT_COPY.packageEmptyTitle}
          body={PROJECT_COPY.packageEmptyBody}
        />
      ) : (
        <ul aria-label={PROJECT_COPY.packageTitle}>
          {items.map((item, index) => (
            <ListCardItem
              key={item.definitionId}
              icon={item.pickMode ? "images" : "package"}
              title={item.definitionName}
              meta={describePackageItem(item, locale)}
              isLast={index === items.length - 1}
              trailing={edit ? <ItemRowMenu item={item} edit={edit} /> : undefined}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function ItemRowMenu({ item, edit }: Readonly<{ item: PackageCardItem; edit: PackageCardEdit }>) {
  const entries: RowMenuEntry[] = [
    {
      label: PROJECT_COPY.itemEditValue,
      icon: "pencil",
      onSelect: () => {
        edit.onEdit(item);
      },
    },
    {
      label: PROJECT_COPY.itemRemove,
      icon: "trash-2",
      isDestructive: true,
      onSelect: () => {
        edit.onRemove(item);
      },
    },
  ];
  return (
    <ProjectRowMenu
      label={PROJECT_COPY.itemActions(item.definitionName)}
      title={item.definitionName}
      entries={entries}
    />
  );
}

/** The item row meta, e.g. "25 foto · hitung foto". @param item - the package item @returns the summary text */
export function describePackageItem(
  item: PackageItemsCardProps["items"][number],
  locale: FormattingLocale,
): string {
  const summary = summariseServiceItems(
    [{ name: item.definitionName, unit: item.unit, value: item.value }],
    locale,
  );
  return item.pickMode ? `${summary} · ${PROJECT_COPY.pickModes[item.pickMode]}` : summary;
}
