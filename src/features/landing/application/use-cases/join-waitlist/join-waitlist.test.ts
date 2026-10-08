import { describe, expect, it, vi } from "vitest";

import { WaitlistStoreError } from "../../errors/waitlist-store-error/waitlist-store-error";
import { joinWaitlist } from "./join-waitlist";

function deps(add = vi.fn(() => Promise.resolve())) {
  return { store: { add }, onFailure: vi.fn() };
}

describe("joinWaitlist", () => {
  it("AC-LND-005 stores the email trimmed and lowercased and answers JOINED", async () => {
    const d = deps();
    const result = await joinWaitlist({ email: " Rina@Example.com ", website: "" }, d);
    expect(result).toEqual({ status: "JOINED" });
    expect(d.store.add).toHaveBeenCalledWith("rina@example.com");
  });

  it("AC-LND-006 answers INVALID with the field error and stores nothing", async () => {
    const d = deps();
    const result = await joinWaitlist({ email: "rina@", website: "" }, d);
    expect(result).toEqual({ status: "INVALID", field: "email", error: "email.invalid" });
    expect(d.store.add).not.toHaveBeenCalled();
  });

  it("AC-LND-006 treats a malformed body as an invalid email", async () => {
    const result = await joinWaitlist(null, deps());
    expect(result).toMatchObject({ status: "INVALID", field: "email" });
  });

  it("AC-LND-009 answers JOINED to a filled bot field and stores nothing", async () => {
    const d = deps();
    const result = await joinWaitlist({ email: "rina@example.com", website: "spam" }, d);
    expect(result).toEqual({ status: "JOINED" });
    expect(d.store.add).not.toHaveBeenCalled();
  });

  it("AC-LND-010 answers FAILED when the store fails and reports the status, not the email", async () => {
    const d = deps(vi.fn(() => Promise.reject(new WaitlistStoreError(500))));
    const result = await joinWaitlist({ email: "rina@example.com", website: "" }, d);
    expect(result).toEqual({ status: "FAILED" });
    expect(d.onFailure).toHaveBeenCalledWith({ reason: "STORE_FAILED", status: 500 });
  });

  it("AC-LND-018 answers FAILED when no store is configured", async () => {
    const onFailure = vi.fn();
    const result = await joinWaitlist(
      { email: "rina@example.com", website: "" },
      { store: null, onFailure },
    );
    expect(result).toEqual({ status: "FAILED" });
    expect(onFailure).toHaveBeenCalledWith({ reason: "NOT_CONFIGURED" });
  });
});
