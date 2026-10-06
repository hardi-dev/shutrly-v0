import type { OwnerPickView } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail.types";
import type { OwnerGroupView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

export interface OwnerPickTileProps {
  readonly workspaceId: string;
  readonly pick: OwnerPickView;
  readonly mode: OwnerGroupView["mode"];
}
