"use client";

import { avatarGroup } from "@/features/booking/domain/session-assignment/session-assignment";
import { clientInitials } from "@/features/booking/ui/client-initials/client-initials";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Tooltip } from "@/ui/primitives/tooltip/tooltip";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SessionTeamAvatarsProps } from "./session-team-avatars.types";

// design.md: the avatars overlap by 6, carry a 2 ring in the card colour and the +n chip is 24 × 24.
const OVERLAP = "-ml-[6px] first:ml-0";
const RING = "ring-2 ring-(--color-semantic-surface-panel)";

/**
 * The avatar group of a session with a team: up to three initials and a +n chip. On desktop each
 * avatar has a *{name} · {role}* tooltip; the whole group opens *Atur tim* (AC-TEAM-026).
 * @param props - the session, its assignments and the open handler
 * @returns the button holding the group
 */
export function SessionTeamAvatars({
  sessionName,
  assignments,
  onOpen,
}: Readonly<SessionTeamAvatarsProps>) {
  const isMobile = useMobileViewport();
  const { shown, overflow } = avatarGroup(assignments);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={PROJECT_COPY.teamGroupLabel(sessionName, assignments.length)}
      className="flex items-center rounded-(--component-avatar-radius) p-(--space-1) outline-none focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
    >
      {shown.map((assignment) => {
        const avatar = (
          <Avatar
            initials={clientInitials(assignment.memberName)}
            size="sm"
            aria-hidden
            className={`${OVERLAP} ${RING}`}
          />
        );
        return isMobile ? (
          <span key={assignment.id} className="inline-flex">
            {avatar}
          </span>
        ) : (
          <Tooltip
            key={assignment.id}
            label={PROJECT_COPY.avatarTooltip(assignment.memberName, assignment.roleName)}
          >
            {avatar}
          </Tooltip>
        );
      })}
      {overflow > 0 ? (
        <span
          className={`${OVERLAP} ${RING} flex size-[24px] shrink-0 items-center justify-center rounded-(--component-avatar-radius) bg-(--color-semantic-surface-subtle) text-(length:--font-size-caption) font-semibold text-(--color-semantic-text-secondary)`}
        >
          {`+${String(overflow)}`}
        </span>
      ) : null}
    </button>
  );
}
