"use client";

import type { KeyboardEvent, TouchEvent } from "react";
import { useRef } from "react";

const SWIPE_MIN_PX = 50;

/** The target of a viewer key: ← / → step, Home / End jump; other keys return null. @param key - the pressed key @param index - the open item @param count - the item count @returns the target index or null */
export function viewerTarget(key: string, index: number, count: number): number | null {
  if (key === "ArrowRight") return Math.min(index + 1, count - 1);
  if (key === "ArrowLeft") return Math.max(index - 1, 0);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

/** Keyboard, swipe and arrow-button navigation for the Media Viewer (C48 › Accessibility). @param index - the open item @param count - the item count @param onIndexChange - moves to another item @returns the handlers */
export function useViewerNavigation(
  index: number,
  count: number,
  onIndexChange: (index: number) => void,
) {
  const touchX = useRef<number | null>(null);
  const go = (target: number | null) => {
    if (target !== null && target !== index) onIndexChange(target);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = viewerTarget(event.key, index, count);
    if (target === null) return;
    event.preventDefault();
    go(target);
  };
  const handleTouchStart = (event: TouchEvent) => {
    touchX.current = event.touches.item(0).clientX;
  };
  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchX.current;
    const end = event.changedTouches.item(0).clientX;
    if (start === null || Math.abs(end - start) < SWIPE_MIN_PX) return;
    go(viewerTarget(end < start ? "ArrowRight" : "ArrowLeft", index, count));
  };
  const handlePrevious = () => {
    go(viewerTarget("ArrowLeft", index, count));
  };
  const handleNext = () => {
    go(viewerTarget("ArrowRight", index, count));
  };
  return { handleKeyDown, handleTouchStart, handleTouchEnd, handlePrevious, handleNext };
}
