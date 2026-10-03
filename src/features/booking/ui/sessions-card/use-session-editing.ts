"use client";

import { useState } from "react";

import type { SessionInput } from "@/features/booking/domain/session/session.types";

import type { SessionsCardProps } from "./sessions-card.types";

/** Tracks which session the dialog is adding or editing and saves it to the right place. @param props - the card's sessions and change handlers @returns the dialog's open state and handlers */
export function useSessionEditing(
  props: Pick<SessionsCardProps, "sessions" | "onAdd" | "onUpdate">,
) {
  const [target, setTarget] = useState<{ readonly index: number | null } | null>(null);
  const index = target?.index ?? null;
  const handleAdd = () => {
    setTarget({ index: null });
  };
  const handleEdit = (editIndex: number) => {
    setTarget({ index: editIndex });
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setTarget(null);
  };
  const handleSave = (session: SessionInput) => {
    if (index === null) props.onAdd(session);
    else props.onUpdate(index, session);
  };
  return {
    isOpen: target !== null,
    session: index === null ? null : (props.sessions[index] ?? null),
    handleAdd,
    handleEdit,
    handleOpenChange,
    handleSave,
  };
}
