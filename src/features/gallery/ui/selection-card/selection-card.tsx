import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { SELECTION_OWNER_COPY as COPY } from "../selection-owner-text/selection-owner.copy";
import {
  cardDescription,
  groupMeta,
  groupStatusChip,
} from "../selection-owner-text/selection-owner-text";
import type { SelectionCardActionProps, SelectionCardProps } from "./selection-card.types";

function CardAction({ card, base }: Readonly<SelectionCardActionProps>) {
  if (card.state === "NO_ITEMS") return null;
  if (card.state === "NOT_PUBLISHED") {
    return (
      <Button variant="secondary" href={`${base}/gallery`}>
        {COPY.openGallery}
      </Button>
    );
  }
  const isReview = card.state === "REVIEW";
  return (
    <Button variant={isReview ? "primary" : "secondary"} href={`${base}/pilihan`}>
      {isReview ? COPY.reviewPicks : COPY.viewPicks}
    </Button>
  );
}

function CardBody({ card }: Readonly<Pick<SelectionCardProps, "card">>) {
  if (card.state === "NO_ITEMS" || card.state === "NOT_PUBLISHED") {
    return (
      <p className="p-(--space-4) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary) md:p-(--space-6)">
        {card.state === "NO_ITEMS" ? COPY.cardNoItems : COPY.cardNotPublishedNote}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-(--space-3) p-(--space-4) md:p-(--space-6)">
      {card.groups.map((group) => (
        <li key={group.id} className="flex items-center justify-between gap-(--space-3)">
          <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
            <span className="truncate text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary)">
              {group.name}
            </span>
            <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
              {groupMeta(group, false)}
            </span>
          </span>
          <StatusChip {...groupStatusChip(group.status)} hasDot />
        </li>
      ))}
    </ul>
  );
}

/** The project page's *Pilihan klien* card: its state (not published, open, needs review, final, no selection items) with one row per group, and the button into the groups page (card export states A–E, A-34, AC-SEL-010). @param props - workspace, project and the card view @returns the card */
export function SelectionCard({ workspaceId, projectId, card }: Readonly<SelectionCardProps>) {
  const base = `/w/${workspaceId}/projects/${projectId}`;
  const submitted = card.groups.filter((group) => group.status === "SUBMITTED").length;
  return (
    <SectionCard
      title={COPY.cardTitle}
      description={cardDescription(card.state, submitted) ?? undefined}
      actions={<CardAction card={card} base={base} />}
      content="flush"
    >
      <CardBody card={card} />
    </SectionCard>
  );
}
