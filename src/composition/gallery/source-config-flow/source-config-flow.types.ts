import type { SourceProvider } from "@/features/gallery/domain/source-provider/source-provider.types";

export interface PhotoSourceView {
  readonly id: string;
  readonly displayName: string;
  readonly provider: SourceProvider;
  readonly isActive: boolean;
}

export interface PhotoSourcesData {
  readonly sources: readonly PhotoSourceView[];
}
