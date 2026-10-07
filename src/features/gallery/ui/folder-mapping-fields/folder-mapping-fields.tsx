"use client";

import { useRouter } from "next/navigation";

import { Alert } from "@/ui/patterns/alert/alert";
import { Select } from "@/ui/patterns/select/select";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { FolderMappingFieldsProps, FolderRowProps } from "./folder-mapping-fields.types";

const PROOF = "proof";

function FolderRow({ path, mapping }: Readonly<FolderRowProps>) {
  const options = [
    { id: PROOF, label: GALLERY_COPY.mappingProof },
    ...(mapping.view?.items ?? []).map((item) => ({ id: item.id, label: item.name })),
  ];
  const change = (id: string) => {
    mapping.choose(path, id === PROOF ? null : id);
  };
  return (
    <Select
      label={GALLERY_COPY.mappingFolderLabel(path)}
      options={options}
      value={mapping.itemOf(path) ?? PROOF}
      onChange={change}
    />
  );
}

function Notice({ mapping, packageHref }: Readonly<FolderMappingFieldsProps>) {
  const router = useRouter();
  const openPackage = () => {
    router.push(packageHref);
  };
  if (mapping.hasFailed) return <Alert tone="danger" title={GALLERY_COPY.mappingLoadFailed} />;
  if (mapping.view === null) return null;
  if (mapping.view.items.length === 0) {
    return (
      <Alert
        tone="info"
        title={GALLERY_COPY.mappingNoItemsTitle}
        body={GALLERY_COPY.mappingNoItemsBody}
        action={{ label: GALLERY_COPY.mappingNoItemsAction, onAction: openPackage }}
      />
    );
  }
  if (mapping.view.folders.length === 0) {
    return (
      <p className="text-(length:--font-size-body-sm) text-(--component-input-helper)">
        {GALLERY_COPY.mappingNoFolders}
      </p>
    );
  }
  return null;
}

/** *Subfolder hasil akhir* in the folder *Edit*: one item choice per subfolder, *Tetap foto proof* by default (F-20, Owner 2026-10-07). @param props - the mapping state and the project page link @returns the fields */
export function FolderMappingFields({ mapping, packageHref }: Readonly<FolderMappingFieldsProps>) {
  const folders =
    mapping.view !== null && mapping.view.items.length > 0 ? mapping.view.folders : [];
  return (
    <fieldset className="flex flex-col gap-(--space-4)">
      <legend className="flex flex-col gap-(--space-1) pb-(--space-3)">
        <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
          {GALLERY_COPY.mappingTitle}
        </span>
        <span className="text-(length:--font-size-label) text-(--component-input-helper)">
          {GALLERY_COPY.mappingHelper}
        </span>
      </legend>
      <Notice mapping={mapping} packageHref={packageHref} />
      {folders.map((path) => (
        <FolderRow key={path} path={path} mapping={mapping} />
      ))}
    </fieldset>
  );
}
