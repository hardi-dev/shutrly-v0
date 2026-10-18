"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import type { GalleryAction } from "@/features/gallery/domain/gallery-state/gallery-header-actions";
import { galleryHeaderActions } from "@/features/gallery/domain/gallery-state/gallery-header-actions";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { CompactBarActions } from "@/ui/patterns/compact-bar/compact-bar-actions";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { ExpiryDialog } from "../expiry-dialog/expiry-dialog";
import { GALLERY_STATUS_MESSAGE_KEY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import { GalleryRowMenu } from "../gallery-row-menu/gallery-row-menu";
import type { GalleryMenuEntry } from "../gallery-row-menu/gallery-row-menu.types";
import { RotatePasswordDialog } from "../rotate-password-dialog/rotate-password-dialog";
import { useCreateGalleryLauncher } from "../use-create-gallery-launcher/use-create-gallery-launcher";
import { GALLERY_LIFECYCLE_COPY_NAMESPACE } from "./gallery-lifecycle.copy";
import type {
  GalleryDialogsProps,
  GalleryHeaderControlsProps,
  GalleryLifecycleProps,
  PrimaryButtonProps,
} from "./gallery-lifecycle.types";

const LABEL_KEY = {
  CHANGE_EXPIRY: "changeExpiry",
  ROTATE_PASSWORD: "rotatePassword",
} as const satisfies Readonly<Record<GalleryAction, string>>;
const ICONS = {
  CHANGE_EXPIRY: "calendar-check",
  ROTATE_PASSWORD: "lock",
} as const;

function menuEntries(
  t: GalleryTranslate,
  menu: readonly GalleryAction[],
  onChoose: (action: GalleryAction) => void,
): GalleryMenuEntry[] {
  return menu.map((action) => ({
    label: t(LABEL_KEY[action]),
    icon: ICONS[action],
    onSelect: () => {
      onChoose(action);
    },
  }));
}

function PrimaryButton({ primary, onChoose }: Readonly<PrimaryButtonProps>) {
  const t = useTranslations(GALLERY_LIFECYCLE_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const handlePress = () => {
    onChoose(primary);
  };
  return (
    <Button
      variant="secondary"
      size={isMobile ? "lg" : "md"}
      onPress={handlePress}
      className="max-md:w-full"
    >
      {t(LABEL_KEY[primary])}
    </Button>
  );
}

function HeaderControls({
  primary,
  menu,
  menuMeta,
  onChoose,
}: Readonly<GalleryHeaderControlsProps>) {
  const t = useTranslations(GALLERY_LIFECYCLE_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const entries = menuEntries(t, menu, onChoose);
  const button = primary === null ? null : <PrimaryButton primary={primary} onChoose={onChoose} />;
  const menuButton =
    entries.length === 0 ? null : (
      <GalleryRowMenu
        label={t("galleryMenu")}
        title={t("galleryMenuTitle")}
        meta={menuMeta}
        entries={entries}
        size="md"
      />
    );
  if (!isMobile) {
    return (
      <PageActions>
        {button}
        {menuButton}
      </PageActions>
    );
  }
  return (
    <>
      <CompactBarActions>{menuButton}</CompactBarActions>
      {button ? (
        <div className="sticky bottom-0 z-10 border-t border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-4) max-md:-mx-(--space-4) max-md:-mb-(--space-5)">
          {button}
        </div>
      ) : null}
    </>
  );
}

function PasswordDialog({ workspaceId, page, actions, onClose }: Readonly<GalleryDialogsProps>) {
  const launcher = useCreateGalleryLauncher({
    workspaceId,
    projectId: page.project.id,
    proposeAction: actions.proposeAction,
  });
  const { handleOpen } = launcher;
  const started = useRef(false);
  // The proposal is a server action: it must start after mount, never while rendering.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    handleOpen();
  }, [handleOpen]);
  if (launcher.initialPassword === null) return null;
  return (
    <RotatePasswordDialog
      workspaceId={workspaceId}
      galleryId={page.gallery.id}
      projectId={page.project.id}
      initialPassword={launcher.initialPassword}
      proposeAction={actions.proposeAction}
      rotatePasswordAction={actions.rotatePasswordAction}
      onClose={onClose}
    />
  );
}

function GalleryDialogs(props: Readonly<GalleryDialogsProps>) {
  const { open, page, workspaceId, actions, onClose } = props;
  if (open === "ROTATE_PASSWORD") return <PasswordDialog {...props} />;
  if (open === "CHANGE_EXPIRY") {
    return (
      <ExpiryDialog
        workspaceId={workspaceId}
        galleryId={page.gallery.id}
        isDraft={false}
        setExpiryAction={actions.setExpiryAction}
        onClose={onClose}
      />
    );
  }
  return null;
}

/** The gallery page's lifecycle controls: header actions by state, the ⋯ menu and every dialog (BR-GAL-003…005, AC-GAL-016…023). */
export function GalleryLifecycle(props: Readonly<GalleryLifecycleProps>) {
  const t = useTranslations(GALLERY_LIFECYCLE_COPY_NAMESPACE);
  const [open, setOpen] = useState<GalleryDialogsProps["open"]>(null);
  const { page } = props;
  const header = galleryHeaderActions(page.gallery.state);
  const handleClose = () => {
    setOpen(null);
  };
  return (
    <>
      <HeaderControls
        primary={header.primary}
        menu={header.menu}
        menuMeta={t("menuSheetMeta", {
          status: t(GALLERY_STATUS_MESSAGE_KEY[page.gallery.state]),
          project: page.project.title,
        })}
        onChoose={setOpen}
      />
      <GalleryDialogs {...props} open={open} onClose={handleClose} />
    </>
  );
}
