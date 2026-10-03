"use client";

import { useState } from "react";

import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

import type { RolesDialog } from "./team-roles-screen.types";

/**
 * Tracks which role dialog is open: add, rename or delete.
 * @returns the open dialog and the handlers that open and close it
 */
export function useRolesDialog() {
  const [dialog, setDialog] = useState<RolesDialog | null>(null);
  function openAdd(): void {
    setDialog({ kind: "add" });
  }
  function openEdit(role: TeamRoleRecord): void {
    setDialog({ kind: "edit", role });
  }
  function openDelete(role: TeamRoleRecord): void {
    setDialog({ kind: "delete", role });
  }
  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) setDialog(null);
  }
  return { dialog, openAdd, openEdit, openDelete, handleOpenChange };
}
