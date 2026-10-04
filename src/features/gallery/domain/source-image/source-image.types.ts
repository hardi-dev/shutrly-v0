export type ImageSize = "thumb" | "preview";

export type DirectImageUrl = (externalFileId: string, width: number) => string | null;
