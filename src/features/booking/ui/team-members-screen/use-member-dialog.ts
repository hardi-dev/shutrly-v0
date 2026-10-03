"use client";

import { useState } from "react";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";

/**
 * Tracks whether the member dialog is open and which member it edits (none means add).
 * @returns the state and the handlers that open and close it
 */
export function useMemberDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [member, setMember] = useState<TeamMemberRecord | undefined>();
  function openAdd(): void {
    setMember(undefined);
    setIsOpen(true);
  }
  function openEdit(next: TeamMemberRecord): void {
    setMember(next);
    setIsOpen(true);
  }
  return { isOpen, member, openAdd, openEdit, setIsOpen };
}
