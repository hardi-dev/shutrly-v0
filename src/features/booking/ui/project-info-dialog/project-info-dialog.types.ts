import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";

export interface ProjectInfoTarget {
  readonly projectId: string;
  readonly title: string;
  readonly notes: string | null;
  readonly agreedPrice: string;
  readonly basePrice: string;
  readonly canEditDeal: boolean;
}

export type UpdateProjectInfoCall = (
  workspaceId: string,
  projectId: string,
  values: unknown,
) => Promise<ProjectWriteResult>;

export interface ProjectInfoDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly workspaceId: string;
  readonly target: ProjectInfoTarget | null;
  readonly updateAction: UpdateProjectInfoCall;
  readonly onSaved: () => void;
}
