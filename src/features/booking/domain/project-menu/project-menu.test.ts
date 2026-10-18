import { describe, expect, it } from "vitest";

import type { ProjectStatus } from "../project-status/project-status.types";
import { buildProjectMenu } from "./project-menu";

const kinds = (status: ProjectStatus, hasWhatsappNumber = true) => {
  const menu = buildProjectMenu({
    status,
    hasWhatsappNumber,
    canShareGallery: false,
    hasFinishedFiles: false,
  });
  return [
    menu.project.map((item) => (item.kind === "STEP" ? item.step : item.kind)),
    menu.sendToClient.map((item) => item.kind),
    menu.destructive.map((item) => item.kind),
  ];
};

describe("project menu (AC-PRJ-027)", () => {
  it.each([
    ["DRAFT", [["CONFIRM_BOOKING", "EDIT_INFO"], ["CHAT_WHATSAPP"], ["DELETE_DRAFT"]]],
    // A-6, BR-DEL-003: Tandai terkirim sits next to the header step on BOOKED and SHOOTING.
    ["BOOKED", [["START_SHOOTING", "MARK_DELIVERED", "EDIT_INFO"], ["CHAT_WHATSAPP"], ["CANCEL"]]],
    [
      "SHOOTING",
      [["FINISH_SHOOTING", "MARK_DELIVERED", "EDIT_INFO"], ["CHAT_WHATSAPP"], ["CANCEL"]],
    ],
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

  it("AC-GFL-020 offers Kirim link galeri in place of Chat WhatsApp when the gallery can be shared", () => {
    const menu = buildProjectMenu({
      status: "BOOKED",
      hasWhatsappNumber: true,
      canShareGallery: true,
      hasFinishedFiles: false,
    });
    expect(menu.sendToClient.map((item) => item.kind)).toEqual(["SHARE_GALLERY"]);
  });

  it("AC-GFL-017 carries the finished-file state on Tandai terkirim", () => {
    const menu = buildProjectMenu({
      status: "SHOOTING",
      hasWhatsappNumber: true,
      canShareGallery: false,
      hasFinishedFiles: true,
    });
    expect(menu.project).toContainEqual({ kind: "MARK_DELIVERED", hasFinishedFiles: true });
  });

  it("A-11 keeps Chat WhatsApp when the gallery can't be shared (A-11 row menus)", () => {
    expect(kinds("BOOKED", true)[1]).toEqual(["CHAT_WHATSAPP"]);
  });
});
