import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

export interface SelectionCardProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly card: SelectionCardView;
}

export type SelectionCardActionProps = Pick<SelectionCardProps, "card"> & {
  /** The project page, the base of every link. */
  readonly base: string;
};
