import type {
  AddOnTargetFailure,
  AddOnWriteResult,
  CreateAddOnResult,
} from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import type {
  AddOnCardView,
  AddOnRowView,
} from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";

export type AddOnStatusAction = (
  workspaceId: string,
  projectId: string,
  input: unknown,
) => Promise<AddOnWriteResult>;

export interface AddOnCardActions {
  readonly createAction: (
    workspaceId: string,
    projectId: string,
    values: unknown,
  ) => Promise<CreateAddOnResult | AddOnTargetFailure>;
  readonly approveAction: AddOnStatusAction;
  readonly cancelAction: AddOnStatusAction;
  readonly deleteDraftAction: AddOnStatusAction;
}

/** The card's approve, cancel and delete flows (useAddOnActions). */
export interface AddOnFlows {
  readonly confirm: AddOnConfirmState | null;
  readonly isPending: boolean;
  readonly open: (state: AddOnConfirmState) => void;
  readonly close: () => void;
  readonly confirmCurrent: () => void;
  readonly deleteDraft: (row: AddOnRowView) => void;
}

export interface AddOnCardBodyProps {
  readonly card: AddOnCardView;
  readonly flows: AddOnFlows;
}

export interface AddOnRowProps {
  readonly row: AddOnRowView;
  readonly flows: AddOnFlows;
}

export interface AddOnCardProps {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly card: AddOnCardView;
  readonly actions: AddOnCardActions;
}

/** Which confirm is open: approve, cancel, or the cancel refusal with its numbers. */
export type AddOnConfirmState =
  | { readonly kind: "APPROVE"; readonly row: AddOnRowView }
  | { readonly kind: "CANCEL"; readonly row: AddOnRowView }
  | {
      readonly kind: "REFUSED";
      readonly row: AddOnRowView;
      readonly usage: number;
      readonly limit: number;
    };
