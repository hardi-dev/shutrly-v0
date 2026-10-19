"use client";

import { createContext, useContext } from "react";

import type { ProjectGalleryActions } from "./use-project-gallery-actions.types";

const ProjectGalleryActionsContext = createContext<ProjectGalleryActions | null>(null);

/**
 * Provides the app host's gallery actions to every project menu and gallery card below it (F-27 A-8, A-10).
 * Features read them with `useProjectGalleryActions`; they never import each other.
 */
export const ProjectGalleryActionsProvider = ProjectGalleryActionsContext.Provider;

/**
 * Reads the app host's gallery actions.
 * @returns the actions, or null outside the host (the buttons then do nothing)
 */
export function useProjectGalleryActions(): ProjectGalleryActions | null {
  return useContext(ProjectGalleryActionsContext);
}
