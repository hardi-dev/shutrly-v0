"use client";

import { useState } from "react";

import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { VIEWER_PICK_COPY as COPY } from "./viewer-pick-actions.copy";
import type {
  NoteButtonProps,
  TargetItemProps,
  ViewerPickActionsProps,
} from "./viewer-pick-actions.types";
import { noteTarget, targetDescription } from "./viewer-pick-text";

const ICONS = { COUNT: "images", QUANTITY: "printer" } as const;

function NoteButton({ target, fileName, onNote }: Readonly<NoteButtonProps>) {
  const handlePress = () => {
    onNote(target);
  };
  return (
    <Button
      variant="secondary"
      iconLeading="message-square-text"
      aria-label={COPY.noteLabel(fileName, target.group.name)}
      onPress={handlePress}
    >
      {COPY.note}
    </Button>
  );
}

function TargetMenuItem({ target, photoId, handle }: Readonly<TargetItemProps>) {
  const handleSelect = () => {
    void handle.toggle(target.group.id, photoId);
  };
  return (
    <MenuItem
      label={target.group.name}
      description={targetDescription(target)}
      icon={ICONS[target.group.mode]}
      isSelected={target.pick !== undefined}
      isDisabled={target.group.status !== "OPEN"}
      onSelect={handleSelect}
    />
  );
}

function TargetSheetItem({ target, photoId, handle, onDone }: Readonly<TargetItemProps>) {
  const handlePress = () => {
    onDone?.();
    void handle.toggle(target.group.id, photoId);
  };
  return (
    <SheetItem
      label={target.group.name}
      description={COPY.sheetCount(target.group.usage, target.group.limit)}
      icon={ICONS[target.group.mode]}
      isSelected={target.pick !== undefined}
      isDisabled={target.group.status !== "OPEN"}
      onPress={handlePress}
    />
  );
}

/** The viewer's top-bar actions on desktop: *Catatan* when the photo is picked in a group with notes, and *Pilih untuk…* listing every group with usage, a check where it's picked and closed groups disabled (pratinjau-pilih-untuk eG55x, pratinjau-tulis-catatan J9NvbJ, A-30, A-32). @param props - the photo, the targets and the note handler @returns the actions */
export function ViewerPickActions({ photo, handle, onNote }: Readonly<ViewerPickActionsProps>) {
  const targets = handle.targetsOf(photo.id);
  const note = noteTarget(targets);
  return (
    <div className="flex items-center gap-(--space-2)">
      {note ? <NoteButton target={note} fileName={photo.fileName} onNote={onNote} /> : null}
      <MenuTrigger label={COPY.pickFor}>
        <Button iconLeading="list-checks">{COPY.pickFor}</Button>
        <Menu aria-label={COPY.pickFor}>
          {targets.map((target) => (
            <TargetMenuItem
              key={target.group.id}
              target={target}
              photoId={photo.id}
              handle={handle}
            />
          ))}
        </Menu>
      </MenuTrigger>
    </div>
  );
}

/** The viewer's pick bar on phones: *Catatan* and *Pilih untuk…*, which opens a Bottom Sheet of the groups with *n/m* and checks (pratinjau-pilih-untuk CV94I, pratinjau-tulis-catatan ThH3S, A-30). @param props - the photo, the targets and the note handler @returns the bar */
export function ViewerPickBar({ photo, handle, onNote }: Readonly<ViewerPickActionsProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const targets = handle.targetsOf(photo.id);
  const note = noteTarget(targets);
  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex justify-end gap-(--space-2) px-(--space-4) pt-(--space-3)">
      {note ? <NoteButton target={note} fileName={photo.fileName} onNote={onNote} /> : null}
      <Button iconLeading="list-checks" onPress={open}>
        {COPY.pickFor}
      </Button>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={COPY.pickFor}
        meta={COPY.sheetMeta(photo.fileName)}
        variant="actions"
      >
        {targets.map((target) => (
          <TargetSheetItem
            key={target.group.id}
            target={target}
            photoId={photo.id}
            handle={handle}
            onDone={close}
          />
        ))}
      </BottomSheet>
    </div>
  );
}
