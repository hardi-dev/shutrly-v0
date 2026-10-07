import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import type { ProofDownloads } from "../use-proof-downloads/use-proof-downloads.types";

export interface PhotosPartProps {
  readonly photos: ProofDownloads;
}

export interface PhotosGroupsProps extends PhotosPartProps {
  readonly groups: readonly PickGroupView[];
}

export interface GroupPickItemProps extends PhotosPartProps {
  readonly group: PickGroupView;
}

export interface DownloadMenuProps extends PhotosPartProps {
  /** Secondary while *Pilih foto* is the main action. */
  readonly isSecondary: boolean;
}

export interface PhoneDownloadMenuProps extends DownloadMenuProps {
  readonly isBusy: boolean;
}
