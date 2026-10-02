import type { SourceProvider } from "@/features/gallery/domain/source-provider/source-provider.types";

import type { SourceMutationActions } from "../use-source-mutations/use-source-mutations";

export interface PhotoSourceItem {
  readonly id: string;
  readonly displayName: string;
  readonly provider: SourceProvider;
  readonly isActive: boolean;
}

export interface PhotoSourcesScreenProps {
  readonly workspaceId: string;
  readonly sources: readonly PhotoSourceItem[];
  readonly actions?: SourceMutationActions;
}
