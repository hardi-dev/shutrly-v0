"use client";

import { createContext, useContext } from "react";

import type { GalleryImageProviderProps } from "./gallery-image-sources.types";

// Without a provider images use the Owner media route, which is what the unit tests expect.
const GalleryImageContext = createContext(false);

/** Tells every photo tile and the preview below it whether to load from Google first (TD D-22). @param props - the flag and the children @returns the provider */
export function GalleryImageProvider({
  googleImages,
  children,
}: Readonly<GalleryImageProviderProps>) {
  return <GalleryImageContext value={googleImages}>{children}</GalleryImageContext>;
}

/** Reads whether photos load from Google first. @returns true when they do */
export function useGoogleImages(): boolean {
  return useContext(GalleryImageContext);
}
