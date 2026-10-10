"use client";

import { useState } from "react";

import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { galleryExpiryFact } from "../gallery-text/gallery-text";
import { RotatePasswordDialog } from "../rotate-password-dialog/rotate-password-dialog";
import { useRotateLink } from "../use-rotate-link/use-rotate-link";
import { AccessRow } from "./access-row";
import { PROJECT_ACCESS_COPY as COPY } from "./project-access-card.copy";
import type { AccessButtonsProps, ProjectAccessCardProps } from "./project-access-card.types";
import { RotateLinkDialog } from "./rotate-link-dialog";

const NOTE = "text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)";

function AccessRows({ card }: Readonly<Pick<ProjectAccessCardProps, "card">>) {
  const locale = useFormattingLocale();
  if (card.state === "INACTIVE") {
    return (
      <>
        <AccessRow label={COPY.link} value={COPY.inactive} isMuted />
        <p className={NOTE}>{COPY.archivedNote}</p>
      </>
    );
  }
  const expiry = galleryExpiryFact(card.gallery, locale);
  return (
    <>
      <AccessRow
        label={COPY.link}
        value={card.maskedLink}
        copy={{ text: card.link, label: COPY.copyLink }}
      />
      <AccessRow
        label={COPY.password}
        value={card.gallery.password}
        copy={{ text: card.gallery.password, label: COPY.copyPassword }}
      />
      {card.state === "DRAFT" ? (
        <p className={NOTE}>{COPY.draftNote}</p>
      ) : (
        <AccessRow label={COPY.expiry} value={expiry.text} isMuted={expiry.isMuted} />
      )}
    </>
  );
}

function AccessButtons({ onRotateLink, onRotatePassword }: Readonly<AccessButtonsProps>) {
  return (
    <div className="flex gap-(--space-2) max-md:w-full max-md:flex-col">
      <Button
        variant="secondary"
        iconLeading="link"
        className="max-md:w-full"
        onPress={onRotateLink}
      >
        {COPY.rotateLink}
      </Button>
      <Button
        variant="secondary"
        iconLeading="key-round"
        className="max-md:w-full"
        onPress={onRotatePassword}
      >
        {COPY.rotatePassword}
      </Button>
    </div>
  );
}

/** The project page's *Akses klien*: the client link (masked, copied whole) and password with *Salin*, the expiry, *Ganti link* and *Ganti password*; inactive once the gallery is archived or the project cancelled (aksesklien-kartu A–C, spec §7, AC-ACC-009). @param props - workspace, the card view and the actions @returns the card */
export function ProjectAccessCard(props: Readonly<ProjectAccessCardProps>) {
  const { card, actions, workspaceId } = props;
  const isMobile = useMobileViewport();
  const link = useRotateLink(props);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const openPassword = () => {
    setIsPasswordOpen(true);
  };
  const closePassword = () => {
    setIsPasswordOpen(false);
  };
  const buttons =
    card.state === "INACTIVE" ? undefined : (
      <AccessButtons onRotateLink={link.open} onRotatePassword={openPassword} />
    );
  return (
    <>
      <SectionCard
        title={COPY.title}
        description={COPY.description}
        actions={isMobile ? undefined : buttons}
      >
        <AccessRows card={card} />
        {isMobile ? buttons : null}
      </SectionCard>
      <RotateLinkDialog
        isOpen={link.isOpen}
        isPending={link.isPending}
        onConfirm={link.confirm}
        onClose={link.close}
      />
      {isPasswordOpen ? (
        <RotatePasswordDialog
          workspaceId={workspaceId}
          galleryId={card.gallery.id}
          projectId={card.projectId}
          initialPassword={card.gallery.password}
          proposeAction={actions.proposeAction}
          rotatePasswordAction={actions.rotatePasswordAction}
          onClose={closePassword}
        />
      ) : null}
    </>
  );
}
