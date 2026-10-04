import "server-only";

// The row a ciphertext belongs to: its AAD, so a ciphertext can't be moved to another row (D-3).
export interface GalleryCipherScope {
  readonly workspaceId: string;
  readonly galleryId: string;
}

export interface EncryptedPassword {
  readonly ciphertext: string;
  readonly iv: string;
  readonly keyVersion: number;
}

export interface GalleryPasswordCipherPort {
  readonly encrypt: (password: string, scope: GalleryCipherScope) => Promise<EncryptedPassword>;
  readonly decrypt: (encrypted: EncryptedPassword, scope: GalleryCipherScope) => Promise<string>;
}
