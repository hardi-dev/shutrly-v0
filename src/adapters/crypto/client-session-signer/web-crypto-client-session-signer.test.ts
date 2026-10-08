import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { describe, expect, it } from "vitest";

import type { ClientSessionPayload } from "@/features/gallery/domain/client-session/client-session.types";

import { createWebCryptoClientSessionSigner } from "./web-crypto-client-session-signer";

const PAYLOAD: ClientSessionPayload = {
  v: 1,
  sid: "0123456789abcdef0123456789abcdef",
  projectId: "00000000-0000-4000-8000-000000000001",
  galleryId: "00000000-0000-4000-8000-000000000002",
  pv: 1,
  th: "fedcba9876543210fedcba9876543210",
  exp: 1_900_000_000,
};
const signer = createWebCryptoClientSessionSigner(TEST_APP_ENV.CLIENT_SESSION_KEY);

function flipFirst(text: string): string {
  return (text.startsWith("A") ? "B" : "A") + text.slice(1);
}

describe("web crypto client session signer (ADR-023, D-3)", () => {
  it("AC-ACC-001 round-trips a payload", async () => {
    expect(await signer.verify(await signer.sign(PAYLOAD))).toEqual(PAYLOAD);
  });

  it("refuses a tampered payload", async () => {
    const [body, mac] = (await signer.sign(PAYLOAD)).split(".");
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, pv: 2 })).toString("base64url");
    expect(await signer.verify(`${forged}.${mac}`)).toBeNull();
    expect(await signer.verify(`${flipFirst(body)}.${mac}`)).toBeNull();
  });

  it("refuses a tampered MAC", async () => {
    const [body, mac] = (await signer.sign(PAYLOAD)).split(".");
    expect(await signer.verify(`${body}.${flipFirst(mac)}`)).toBeNull();
  });

  it("refuses a cookie signed with another key", async () => {
    const other = createWebCryptoClientSessionSigner(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
    expect(await signer.verify(await other.sign(PAYLOAD))).toBeNull();
  });

  it.each(["", "abc", "a.b.c", "!!.??", "A.B"])("refuses the malformed value %j", async (value) => {
    expect(await signer.verify(value)).toBeNull();
  });

  it("C-103 keeps no secret in the cookie: only ids, versions and hashes", async () => {
    const [body] = (await signer.sign(PAYLOAD)).split(".");
    const decoded: unknown = JSON.parse(Buffer.from(body, "base64url").toString());
    expect(Object.keys(decoded as object)).toEqual([
      "v",
      "sid",
      "projectId",
      "galleryId",
      "pv",
      "th",
      "exp",
    ]);
  });
});
