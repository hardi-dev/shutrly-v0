"use client";

import { useState } from "react";

import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryBrowse, OpenPreview } from "./use-photo-preview.types";

// Load the next page of *Semua foto* when the preview gets this close to the end.
const PRELOAD_DISTANCE = 3;

/** Opens the photo preview from the *Foto* card or *Semua foto*, and loads the next browse page as the Owner moves towards the end (AC-GAL-031, A-13). @param browse - the *Semua foto* state @returns the preview list, index, total and handlers */
export function usePhotoPreview(browse: GalleryBrowse) {
  const [preview, setPreview] = useState<OpenPreview | null>(null);
  const fromBrowse = preview?.from === "BROWSE";
  const photos = fromBrowse ? browse.state.photos : (preview?.list ?? []);
  const total = fromBrowse
    ? (browse.state.page?.summary?.photoCount ?? photos.length)
    : photos.length;
  const open =
    (from: OpenPreview["from"]) => (photo: GalleryPhotoView, list: readonly GalleryPhotoView[]) => {
      setPreview({ from, list, index: Math.max(list.indexOf(photo), 0) });
    };
  const handleIndexChange = (index: number) => {
    setPreview((current) => (current ? { ...current, index } : current));
    if (fromBrowse && index >= photos.length - PRELOAD_DISTANCE) void browse.loadMore();
  };
  const close = () => {
    setPreview(null);
  };
  return {
    photos,
    total,
    index: preview?.index ?? null,
    openFromCard: open("CARD"),
    openFromBrowse: open("BROWSE"),
    handleIndexChange,
    close,
  };
}
