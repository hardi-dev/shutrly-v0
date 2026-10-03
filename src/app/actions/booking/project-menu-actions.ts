import type { ProjectMenuActions } from "@/features/booking/ui/project-menu-host/project-menu-host.types";

import { updateClientAction } from "./clients";
import {
  advanceProjectAction,
  cancelProjectAction,
  deleteDraftAction,
  loadClientForEditAction,
  loadProjectDetailAction,
  updateProjectInfoAction,
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
