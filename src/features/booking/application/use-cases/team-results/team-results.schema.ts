import { z } from "zod";

export const teamRoleFieldErrorKeySchema = z.enum(["EMPTY", "TOO_LONG"]).catch("EMPTY");

export const teamMemberFieldErrorKeySchema = z
  .enum(["EMPTY", "TOO_LONG", "REQUIRED", "INVALID", "TAKEN"])
  .catch("INVALID");

export const teamMemberFieldSchema = z.enum(["name", "whatsappNumber", "email", "roleIds"]);
