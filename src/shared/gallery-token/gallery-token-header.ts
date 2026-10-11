/**
 * Server-internal request header that carries the gallery token of a `/g/<token>` path from the
 * proxy to server rendering (D-7). Never sent to the browser and never logged (C-103).
 */
export const GALLERY_TOKEN_HEADER = "x-shutrly-gallery-token";
