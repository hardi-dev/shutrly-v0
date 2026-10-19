/** What a project's gallery actions need from the app host: the project and, for Tandai terkirim, its title (F-27 iteration 6). */
export interface MarkDeliveredTarget {
  readonly projectId: string;
  readonly title: string;
}

/** The app-level gallery actions that feature menus and cards trigger without importing each other. */
export interface ProjectGalleryActions {
  /** Opens the share dialog for a project's gallery (*Kirim link ke klien*). */
  readonly openShare: (projectId: string) => void;
  /** Opens the *Tandai terkirim* confirm for a project. */
  readonly openMarkDelivered: (target: MarkDeliveredTarget) => void;
}
