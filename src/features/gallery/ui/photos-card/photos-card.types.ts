import type { ReactNode } from "react";

export interface PhotosCardProps {
  readonly hasPhotos: boolean;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
}
