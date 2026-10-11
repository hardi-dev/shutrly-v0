import { useTranslations } from "next-intl";

import { summariseServiceItems } from "@/features/booking/domain/item-summary/item-summary";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { PICK_MODE_MESSAGE_KEY } from "../project-copy/project-copy.copy";
import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { ProjectRowMenu } from "../project-row-menu/project-row-menu";
import type { RowMenuEntry } from "../project-row-menu/project-row-menu.types";
import { PACKAGE_ITEMS_CARD_COPY_NAMESPACE } from "./package-items-card.copy";
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
  const t = useTranslations(PACKAGE_ITEMS_CARD_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const serviceDescription = isMobile
    ? t("packageDescriptionMobile", { serviceName })
    : t("packageDescriptionDesktop", { serviceName });
  return (
    <SectionCard
      title={t("packageTitle")}
      description={description ?? serviceDescription}
      content="flush"
      actions={
        edit ? (
          <Button variant="secondary" iconLeading="plus" onPress={edit.onAdd}>
            {isMobile ? t("addItemMobile") : t("addItemDesktop")}
          </Button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon="package"
          placement="in-card"
          title={t("packageEmptyTitle")}
          body={t("packageEmptyBody")}
        />
      ) : (
        <ul aria-label={t("packageTitle")}>
          {items.map((item, index) => (
            <ListCardItem
              key={item.definitionId}
              icon={item.pickMode ? "images" : "package"}
              title={item.definitionName}
              meta={describePackageItem(t, item, locale)}
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
  const t = useTranslations(PACKAGE_ITEMS_CARD_COPY_NAMESPACE);
  const entries: RowMenuEntry[] = [
    {
      label: t("itemEditValue"),
      icon: "pencil",
      onSelect: () => {
        edit.onEdit(item);
      },
    },
    {
      label: t("itemRemove"),
      icon: "trash-2",
      isDestructive: true,
      onSelect: () => {
        edit.onRemove(item);
      },
    },
  ];
  return (
    <ProjectRowMenu
      label={t("itemActions", { name: item.definitionName })}
      title={item.definitionName}
      entries={entries}
    />
  );
}

/** The item row meta, e.g. "25 foto · hitung foto". @param item - the package item @returns the summary text */
export function describePackageItem(
  t: ProjectTranslate,
  item: PackageItemsCardProps["items"][number],
  locale: FormattingLocale,
): string {
  const summary = summariseServiceItems(
    [{ name: item.definitionName, unit: item.unit, value: item.value }],
    locale,
  );
  return item.pickMode ? `${summary} · ${t(PICK_MODE_MESSAGE_KEY[item.pickMode])}` : summary;
}
