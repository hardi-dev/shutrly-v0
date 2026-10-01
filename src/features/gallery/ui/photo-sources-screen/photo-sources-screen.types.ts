import type { SourceProvider } from "@/features/gallery/domain/source-provider/source-provider.types";

export interface PhotoSourceItem {
  readonly id: string;
  readonly displayName: string;
  readonly provider: SourceProvider;
  readonly isActive: boolean;
}

export interface PhotoSourcesScreenProps {
  readonly workspaceId: string;
  readonly sources: readonly PhotoSourceItem[];
}
