"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

/** The open state of *Tambah folder*, *Ganti nama* and *Hapus*, refreshing the page after a link (AC-GAL-005, AC-GAL-013, AC-GAL-037). @returns the open dialogs and their handlers */
export function useSourceDialogs() {
  const router = useRouter();
  const [isLinking, setIsLinking] = useState(false);
  const [deleting, setDeleting] = useState<GallerySourceView | null>(null);
  const [renaming, setRenaming] = useState<GallerySourceView | null>(null);
  const openLinking = () => {
    setIsLinking(true);
  };
  const handleLinked = () => {
    setIsLinking(false);
    router.refresh();
  };
  const closeDeleting = () => {
    setDeleting(null);
  };
  const closeRenaming = () => {
    setRenaming(null);
  };
  return {
    isLinking,
    deleting,
    renaming,
    openLinking,
    setIsLinking,
    handleLinked,
    setDeleting,
    closeDeleting,
    setRenaming,
    closeRenaming,
  };
}
