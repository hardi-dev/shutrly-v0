"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

/** The open state of *Tambah folder* and *Lepas folder*, refreshing the page after a link (AC-GAL-005, AC-GAL-013). @returns the open dialogs and their handlers */
export function useSourceDialogs() {
  const router = useRouter();
  const [isLinking, setIsLinking] = useState(false);
  const [removing, setRemoving] = useState<GallerySourceView | null>(null);
  const openLinking = () => {
    setIsLinking(true);
  };
  const handleLinked = () => {
    setIsLinking(false);
    router.refresh();
  };
  const closeRemoving = () => {
    setRemoving(null);
  };
  return {
    isLinking,
    removing,
    openLinking,
    setIsLinking,
    handleLinked,
    setRemoving,
    closeRemoving,
  };
}
