import { RecordingEmailSender } from "@tests/support/auth/recording-email-sender";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/logging/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from "@/shared/logging/logger";

import type { AuthLink } from "../ports/auth-email/auth-email.port";
import { LinkOutbox } from "./link-outbox";

const link: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "o@x.dev",
  name: "O",
  url: "https://app/verify/confirm?token=secret",
};

describe("LinkOutbox", () => {
  it("AC-AUTH-001 sends queued links on flush and empties the queue", async () => {
    const sender = new RecordingEmailSender();
    const outbox = new LinkOutbox(sender, "r1");
    outbox.enqueue(link);
    expect(await outbox.flush()).toBe("SENT");
    expect(sender.sent).toEqual([link]);
    expect(outbox.pendingCount).toBe(0);
  });

  it("AC-AUTH-021 AC-AUTH-022 reports FAILED and logs no link when the provider fails", async () => {
    const sender = new RecordingEmailSender();
    sender.failing = true;
    const outbox = new LinkOutbox(sender, "r1");
    outbox.enqueue(link);
    expect(await outbox.flush()).toBe("FAILED");
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain("secret");
  });

  it("AC-AUTH-016 hands a background flush to waitUntil, and skips it when nothing is queued", async () => {
    const sender = new RecordingEmailSender();
    const outbox = new LinkOutbox(sender, "r1");
    const waitUntil = vi.fn();
    outbox.flushInBackground(waitUntil);
    expect(waitUntil).not.toHaveBeenCalled();
    outbox.enqueue(link);
    outbox.flushInBackground(waitUntil);
    await waitUntil.mock.calls[0]?.[0];
    expect(sender.sent).toHaveLength(1);
  });
});
