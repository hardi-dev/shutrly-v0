/** The share message the dialog shows, as the server returns it (AC-GFL-021 to 024). The password is inside `text`. */
export interface GalleryShareMessage {
  readonly recipient: { readonly name: string; readonly phone: string | null };
  readonly text: string;
  /** The `wa.me` link with the text prefilled, or null without a WhatsApp number (AC-GFL-024). */
  readonly waUrl: string | null;
}

/** The loader's result: the message, or a refusal code the dialog shows as its error state (AC-GFL-025). */
export type GalleryShareLoad =
  ({ readonly ok: true } & GalleryShareMessage) | { readonly ok: false; readonly code: string };

export type GalleryShareLoader = (
  workspaceId: string,
  projectId: string,
) => Promise<GalleryShareLoad>;

export type GalleryShareState =
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | { readonly status: "ready"; readonly message: GalleryShareMessage };

export interface GalleryShareDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly workspaceId: string;
  readonly projectId: string;
  /** Loads the share message on open; the host passes the server action (D-9). */
  readonly loadShare: GalleryShareLoader;
  /** Opens the F-06 client dialog for *Tambah nomor WhatsApp* (A-8); the app-level host renders it. */
  readonly onAddNumber: () => void;
  /** Changes after a client save so the share data reloads (A-8). */
  readonly revision?: number;
}

export interface UseGalleryShareInput {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly loadShare: GalleryShareLoader;
  readonly revision: number;
}

export interface GalleryShareBodyProps {
  readonly state: GalleryShareState;
  readonly workspaceId: string;
  readonly onAddNumber: () => void;
}

export interface GalleryShareActionsProps {
  readonly state: GalleryShareState;
  readonly onClose: () => void;
}

export interface GalleryShareReadyProps {
  readonly message: GalleryShareMessage;
  readonly workspaceId: string;
  readonly onAddNumber: () => void;
}
