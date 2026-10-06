/** One file of a bulk download: the same-origin `/g/{token}/unduh/{id}` URL and its name. */
export interface DownloadItem {
  readonly id: string;
  readonly url: string;
  readonly fileName: string;
}

export type DownloadPhase = "IDLE" | "RUNNING" | "DONE" | "CANCELLED";

export interface DownloadProgress {
  readonly phase: DownloadPhase;
  /** Files finished so far, failed ones included (*n dari m foto selesai*). */
  readonly done: number;
  readonly total: number;
  /** Ids of the files that failed (*Gagal* tiles, AC-DEL-005). */
  readonly failedIds: readonly string[];
}

export interface SequentialDownloadOptions {
  /** Injectable for tests; defaults to `fetch`. */
  readonly fetchFn?: (url: string, init: RequestInit) => Promise<Response>;
  /** Injectable for tests; defaults to saving through a temporary `<a download>`. */
  readonly save?: (blob: Blob, fileName: string) => void;
}

export interface SequentialDownload {
  readonly progress: DownloadProgress;
  readonly start: (items: readonly DownloadItem[]) => void;
  readonly cancel: () => void;
  /** Downloads the failed files of the last run again (*Coba lagi*). */
  readonly retry: () => void;
  /** Clears a finished or cancelled run. */
  readonly reset: () => void;
}
