export interface ImageFallbackState {
  /** The URL to render, or null when the main URL and its fallback both failed. */
  readonly src: string | null;
  readonly onError: () => void;
}
