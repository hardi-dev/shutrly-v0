"use client";

import { useState } from "react";

import { localizePackageValue } from "@/features/booking/domain/package-value/package-value";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";

import { reducePackageDraft } from "../use-create-project-form/package-draft";
import type { DraftItem, PackageDraftAction } from "../use-create-project-form/package-draft.types";
import type { CreateForm } from "../use-create-project-form/use-create-project-form.types";

/** Holds the package draft and mirrors it into the form's `items`, which is what gets saved (AC-PRJ-030). @param form - the create form @returns the items and how to change them */
export function usePackageDraft(form: CreateForm) {
  const [items, setItems] = useState<readonly DraftItem[]>([]);
  const locale = useFormattingLocale();
  const applyItems = (next: readonly DraftItem[]) => {
    setItems(next);
    form.setValue(
      "items",
      next.map((item) => ({
        definitionId: item.definitionId,
        value: localizePackageValue(item.value, locale),
      })),
    );
  };
  const dispatchPackage = (action: PackageDraftAction) => {
    applyItems(reducePackageDraft(items, action));
  };
  return { items, applyItems, dispatchPackage };
}
