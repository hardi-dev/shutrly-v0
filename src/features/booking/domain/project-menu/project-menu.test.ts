import { describe, expect, it } from "vitest";

import type { ProjectStatus } from "../project-status/project-status.types";
import { buildProjectMenu } from "./project-menu";

const kinds = (status: ProjectStatus, hasWhatsappNumber = true) => {
  const menu = buildProjectMenu({ status, hasWhatsappNumber });
  return [
    menu.project.map((item) => (item.kind === "STEP" ? item.step : item.kind)),
    menu.sendToClient.map((item) => item.kind),
    menu.destructive.map((item) => item.kind),
  ];
};

describe("project menu (AC-PRJ-027)", () => {
  it.each([
    ["DRAFT", [["CONFIRM_BOOKING", "EDIT_INFO"], ["CHAT_WHATSAPP"], ["DELETE_DRAFT"]]],
    ["BOOKED", [["START_SHOOTING", "EDIT_INFO"], ["CHAT_WHATSAPP"], ["CANCEL"]]],
    ["SHOOTING", [["FINISH_SHOOTING", "EDIT_INFO"], ["CHAT_WHATSAPP"], ["CANCEL"]]],
    ["POST_PROCESSING", [["EDIT_INFO"], ["CHAT_WHATSAPP"], []]],
    ["DELIVERED", [["EDIT_INFO"], ["CHAT_WHATSAPP"], []]],
    ["COMPLETED", [[], ["CHAT_WHATSAPP"], []]],
    ["CANCELLED", [[], ["CHAT_WHATSAPP"], []]],
  ] as const)("AC-PRJ-027 builds the %s menu", (status, expected) => {
    expect(kinds(status)).toEqual(expected);
  });

  it("AC-PRJ-027 offers Tambah nomor WhatsApp when the client has no number", () => {
    expect(kinds("BOOKED", false)[1]).toEqual(["ADD_WHATSAPP_NUMBER"]);
  });
});
