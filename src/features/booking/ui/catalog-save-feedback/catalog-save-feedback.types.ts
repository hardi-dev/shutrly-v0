export interface CatalogSaveFailureArgs {
  readonly setError: (error: string) => void;
  readonly retry: () => void;
}
