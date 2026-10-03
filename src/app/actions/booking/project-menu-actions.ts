import type { ProjectEditActions } from "@/features/booking/ui/project-edit/project-edit.types";
import type { ProjectMenuActions } from "@/features/booking/ui/project-menu-host/project-menu-host.types";

import { updateClientAction } from "./clients";
import {
  addProjectItemAction,
  addSessionAction,
  advanceProjectAction,
  cancelProjectAction,
  deleteDraftAction,
  deleteSessionAction,
  loadClientForEditAction,
  loadProjectDetailAction,
  removeProjectItemAction,
  updateProjectFieldValuesAction,
  updateProjectInfoAction,
  updateProjectItemValueAction,
  updateSessionAction,
} from "./projects";

/** The server actions behind every project ⋯ menu, handed from a page to the client screens. */
export const PROJECT_MENU_ACTIONS: ProjectMenuActions = {
  advanceAction: advanceProjectAction,
  updateInfoAction: updateProjectInfoAction,
  cancelAction: cancelProjectAction,
  deleteDraftAction,
  loadDetailAction: loadProjectDetailAction,
  loadClientAction: loadClientForEditAction,
  updateClientAction,
};

/** The server actions behind the detail page's package, field booking and session edits. */
export const PROJECT_EDIT_ACTIONS: ProjectEditActions = {
  addItemAction: addProjectItemAction,
  updateItemAction: updateProjectItemValueAction,
  removeItemAction: removeProjectItemAction,
  updateFieldsAction: updateProjectFieldValuesAction,
  addSessionAction,
  updateSessionAction,
  deleteSessionAction,
};
