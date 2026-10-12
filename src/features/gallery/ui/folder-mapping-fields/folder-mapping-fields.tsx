"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";
import { Select } from "@/ui/patterns/select/select";

import { FOLDER_MAPPING_FIELDS_COPY_NAMESPACE } from "./folder-mapping-fields.copy";
import type { FolderMappingFieldsProps, ItemRowProps } from "./folder-mapping-fields.types";

const NONE = "none";

function ItemRow({ item, mapping }: Readonly<ItemRowProps>) {
  const t = useTranslations(FOLDER_MAPPING_FIELDS_COPY_NAMESPACE);
  const folders = (mapping.view?.folders ?? []).filter(
    (path) => !mapping.isTakenByOther(path, item.id),
  );
  const options = [
    { id: NONE, label: t("mappingNone") },
    ...folders.map((path) => ({ id: path, label: path })),
  ];
  const change = (id: string) => {
    mapping.chooseFolder(item.id, id === NONE ? null : id);
  };
  return (
    <Select
      label={item.name}
      options={options}
      value={mapping.folderOf(item.id) ?? NONE}
      onChange={change}
    />
  );
}

const SKELETON_ROWS = ["first", "second"];

/** Two item rows while the subfolders load: a label bar over a select-height bar. @returns the hidden placeholder */
function MappingSkeleton() {
  return (
    <div
      aria-hidden="true"
      data-testid="folder-mapping-skeleton"
      className="flex flex-col gap-(--space-4)"
    >
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="flex animate-pulse flex-col gap-(--space-2)">
          <span className="h-3 w-24 rounded-(--radius-sm) bg-(--component-table-skeleton)" />
          <span className="h-(--component-input-height) rounded-(--component-input-radius) bg-(--component-table-skeleton)" />
        </div>
      ))}
    </div>
  );
}

function Notice({ mapping, packageHref }: Readonly<FolderMappingFieldsProps>) {
  const t = useTranslations(FOLDER_MAPPING_FIELDS_COPY_NAMESPACE);
  const router = useRouter();
  const openPackage = () => {
    router.push(packageHref);
  };
  if (mapping.hasFailed) return <Alert tone="danger" title={t("mappingLoadFailed")} />;
  if (mapping.view === null) return <MappingSkeleton />;
  if (mapping.view.items.length === 0) {
    return (
      <Alert
        tone="info"
        title={t("mappingNoItemsTitle")}
        body={t("mappingNoItemsBody")}
        action={{ label: t("mappingNoItemsAction"), onAction: openPackage }}
      />
    );
  }
  if (mapping.view.folders.length === 0) {
    return (
      <p className="text-(length:--font-size-body-sm) text-(--component-input-helper)">
        {t("mappingNoFolders")}
      </p>
    );
  }
  return null;
}

/** *Subfolder hasil akhir* in the folder *Edit*: each package item picks its subfolder, none by default; unpicked subfolders stay proofs (F-21, Owner 2026-10-07). @param props - the mapping state and the project page link @returns the fields */
export function FolderMappingFields({ mapping, packageHref }: Readonly<FolderMappingFieldsProps>) {
  const t = useTranslations(FOLDER_MAPPING_FIELDS_COPY_NAMESPACE);
  const items = mapping.view !== null && mapping.view.folders.length > 0 ? mapping.view.items : [];
  return (
    <fieldset className="flex flex-col gap-(--space-4)">
      <legend className="flex flex-col gap-(--space-1) pb-(--space-3)">
        <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
          {t("mappingTitle")}
        </span>
        <span className="text-(length:--font-size-label) text-(--component-input-helper)">
          {t("mappingHelper")}
        </span>
      </legend>
      <Notice mapping={mapping} packageHref={packageHref} />
      {items.map((item) => (
        <ItemRow key={item.id} item={item} mapping={mapping} />
      ))}
    </fieldset>
  );
}
