import "server-only";

import type { ClientSessionSignerPort } from "@/features/gallery/application/ports/client-session-signer/client-session-signer.port";
import { clientSessionPayloadSchema } from "@/features/gallery/application/schemas/client-session/client-session.schema";

const ALGORITHM = { name: "HMAC", hash: "SHA-256" } as const;

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[\w-]*$/.test(text)) return null;
  try {
    const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function parsePayload(bytes: Uint8Array): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/**
 * Creates the client session signer from the base64url `CLIENT_SESSION_KEY` (32 bytes, ADR-023).
 * The MAC is checked with `crypto.subtle.verify`, which compares in constant time.
 * @param rawKey - the Worker secret
 * @returns the signer port
 */
export function createWebCryptoClientSessionSigner(rawKey: string): ClientSessionSignerPort {
  const keyBytes = fromBase64Url(rawKey);
  if (!keyBytes) throw new Error("CLIENT_SESSION_KEY is not base64url");
  const key = crypto.subtle.importKey("raw", keyBytes, ALGORITHM, false, ["sign", "verify"]);
  return {
    async sign(payload) {
      const body = new TextEncoder().encode(JSON.stringify(payload));
      const mac = await crypto.subtle.sign("HMAC", await key, body);
      return `${toBase64Url(body)}.${toBase64Url(new Uint8Array(mac))}`;
    },
    async verify(value) {
      const parts = value.split(".");
      if (parts.length !== 2) return null;
      const [encodedBody, encodedMac] = parts;
      const body = fromBase64Url(encodedBody);
      const mac = fromBase64Url(encodedMac);
      if (!body || !mac) return null;
      if (!(await crypto.subtle.verify("HMAC", await key, mac, body))) return null;
      const parsed = clientSessionPayloadSchema.safeParse(parsePayload(body));
      return parsed.success ? parsed.data : null;
    },
  };
}
