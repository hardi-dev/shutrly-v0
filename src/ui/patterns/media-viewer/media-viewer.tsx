"use client";

import { Button as AriaButton, Dialog, Modal, ModalOverlay } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { useRestoreFocus } from "@/ui/hooks/use-restore-focus/use-restore-focus";
import { Icon } from "@/ui/primitives/icon/icon";

import { MEDIA_VIEWER_COPY } from "./media-viewer.copy";
import type {
  ArrowsProps,
  FilmstripProps,
  FilmstripThumbProps,
  MediaViewerProps,
  StageProps,
  TopBarProps,
  ViewerFrameProps,
} from "./media-viewer.types";
import { useViewerNavigation } from "./use-viewer-navigation";

const ICON_BUTTON =
  "flex size-(--space-10) shrink-0 cursor-pointer items-center justify-center rounded-(--radius-md) text-(--component-media-viewer-text) outline-none data-focus-visible:outline-2 data-focus-visible:outline-(--component-media-viewer-thumb-active-border)";
const ARROW = cn(
  ICON_BUTTON,
  "absolute top-1/2 -translate-y-1/2 border border-(--component-media-viewer-text)",
);

function Stage({ item, src, missingText }: Readonly<StageProps>) {
  if (item.isMissing) {
    return (
      <div className="flex flex-col items-center gap-(--space-3) text-(--component-media-viewer-text)">
        <Icon name="image-off" size="lg" aria-hidden="true" />
        <p className="text-(length:--font-size-body)">{missingText}</p>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the private media proxy must not go through the image optimiser
    <img src={src} alt={item.title} className="max-h-full max-w-full object-contain" />
  );
}

function FilmstripThumb({
  item,
  position,
  isActive,
  src,
  onSelect,
}: Readonly<FilmstripThumbProps>) {
  const handlePress = () => {
    onSelect(position);
  };
  return (
    <li className="shrink-0">
      <AriaButton
        aria-label={item.title}
        aria-current={isActive ? "true" : undefined}
        onPress={handlePress}
        className={cn(
          "block size-[44px] cursor-pointer overflow-hidden rounded-(--component-media-viewer-thumb-radius) bg-(--component-photo-tile-image-background) outline-none md:size-(--space-12)",
          isActive
            ? "border-2 border-(--component-media-viewer-thumb-active-border)"
            : "opacity-(--component-media-viewer-thumb-inactive-opacity)",
          "data-focus-visible:outline-2 data-focus-visible:outline-(--component-media-viewer-thumb-active-border)",
        )}
      >
        {item.isMissing ? null : (
          // eslint-disable-next-line @next/next/no-img-element -- the private media proxy must not go through the image optimiser
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        )}
      </AriaButton>
    </li>
  );
}

function Filmstrip({ items, index, imageSrc, onIndexChange }: Readonly<FilmstripProps>) {
  return (
    <ul
      aria-label={MEDIA_VIEWER_COPY.filmstrip}
      className="flex justify-center gap-(--component-media-viewer-filmstrip-gap) overflow-x-auto px-(--component-media-viewer-bar-padding-x) py-(--component-media-viewer-bar-padding-y)"
    >
      {items.map((item, position) => (
        <FilmstripThumb
          key={item.id}
          item={item}
          position={position}
          isActive={position === index}
          src={imageSrc(item, "thumb")}
          onSelect={onIndexChange}
        />
      ))}
    </ul>
  );
}

function TopBar({ item, renderActions, onClose }: Readonly<TopBarProps>) {
  return (
    <header className="flex items-center gap-(--component-media-viewer-bar-gap) px-(--component-media-viewer-bar-padding-x) py-(--component-media-viewer-bar-padding-y) text-(--component-media-viewer-text)">
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="truncate text-(length:--font-size-body) font-bold">{item.title}</h2>
        <p className="truncate text-(length:--font-size-caption) md:text-(length:--font-size-body-sm)">
          {item.meta}
        </p>
      </div>
      {renderActions?.(item)}
      <AriaButton
        autoFocus
        aria-label={MEDIA_VIEWER_COPY.close}
        onPress={onClose}
        className={ICON_BUTTON}
      >
        <Icon name="x" aria-hidden="true" />
      </AriaButton>
    </header>
  );
}

function Arrows({ index, count, nav }: Readonly<ArrowsProps>) {
  return (
    <>
      <AriaButton
        aria-label={MEDIA_VIEWER_COPY.previous}
        isDisabled={index === 0}
        onPress={nav.handlePrevious}
        className={cn(ARROW, "left-(--component-media-viewer-nav-inset)")}
      >
        <Icon name="arrow-left" aria-hidden="true" />
      </AriaButton>
      <AriaButton
        aria-label={MEDIA_VIEWER_COPY.next}
        isDisabled={index === count - 1}
        onPress={nav.handleNext}
        className={cn(ARROW, "right-(--component-media-viewer-nav-inset)")}
      >
        <Icon name="arrow-right" aria-hidden="true" />
      </AriaButton>
    </>
  );
}

function ViewerFrame(props: Readonly<ViewerFrameProps>) {
  const isMobile = useMobileViewport();
  const { items, index, onIndexChange } = props;
  const item = items[index];
  const nav = useViewerNavigation(index, items.length, onIndexChange);
  return (
    <Dialog aria-label={MEDIA_VIEWER_COPY.label(item.title)} className="h-full outline-none">
      <div onKeyDown={nav.handleKeyDown} className="flex h-full flex-col">
        <TopBar item={item} renderActions={props.renderActions} onClose={props.onClose} />
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-(--space-4) md:px-(--space-16)"
          onTouchStart={nav.handleTouchStart}
          onTouchEnd={nav.handleTouchEnd}
        >
          <Stage item={item} src={props.imageSrc(item, "stage")} missingText={props.missingText} />
          {isMobile ? null : <Arrows index={index} count={items.length} nav={nav} />}
        </div>
        <Filmstrip
          items={items}
          index={index}
          imageSrc={props.imageSrc}
          onIndexChange={onIndexChange}
        />
      </div>
    </Dialog>
  );
}

/** A full-screen photo preview on a dark backdrop: top bar, stage with ← / →, filmstrip; arrow keys, Home/End and Esc (C48). @param props - items, the open index and handlers @returns the viewer, or nothing while closed */
export function MediaViewer(props: Readonly<MediaViewerProps>) {
  const isOpen = props.index !== null && props.items.length > 0;
  useRestoreFocus(isOpen);
  const handleOpenChange = (open: boolean) => {
    if (!open) props.onClose();
  };
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      className="fixed inset-0 z-50 bg-(--component-media-viewer-backdrop)"
    >
      <Modal className="h-dvh w-full">
        {props.index === null ? null : (
          <ViewerFrame {...props} index={Math.min(props.index, props.items.length - 1)} />
        )}
      </Modal>
    </ModalOverlay>
  );
}
