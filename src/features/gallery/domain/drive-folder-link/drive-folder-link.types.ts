export interface DriveFolderRef {
  readonly folderId: string;
  readonly resourceKey: string | null;
}

export type DriveFolderLinkResult =
  | ({ readonly ok: true } & DriveFolderRef)
  | { readonly ok: false; readonly code: "NOT_DRIVE" | "NOT_A_FOLDER" };
