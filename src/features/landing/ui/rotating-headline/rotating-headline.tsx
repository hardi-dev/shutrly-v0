"use client";

import { cn } from "@/ui/cn/cn";

import { useMeasuredWidth } from "../use-measured-width/use-measured-width";
import { useRotatingWord } from "../use-rotating-word/use-rotating-word";
import { ROTATING_HEADLINE_COPY as COPY } from "./rotating-headline.copy";

// Display sizes are a DESIGN TOKEN GAP (plan.md › Token mapping): 32/36 px phone, 68/76 px desktop.
const LINE =
  "text-[32px]/[36px] tracking-[-1.4px] whitespace-nowrap text-(--color-semantic-text-primary) md:text-[68px]/[76px] md:tracking-[-3px]";
// Words slide and fade on an ease-out; the highlight resizes with a slight overshoot (bounce).
const WORD_MOTION =
  "transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const BOX_MOTION =
  "transition-[width] duration-[650ms] ease-[cubic-bezier(0.34,1.35,0.64,1)] motion-reduce:transition-none";

/**
 * Where a word sits in the rotation: showing, sliding out above, or waiting below.
 * @param word - the word's position in the list
 * @param index - the word now showing
 * @param count - how many words rotate
 * @returns the word's position and opacity classes
 */
function wordState(word: number, index: number, count: number): string {
  if (word === index) return "translate-y-0 opacity-100 delay-75";
  if (word === (index + count - 1) % count) return "-translate-y-[70%] opacity-0";
  return "translate-y-[70%] opacity-0 transition-none";
}

/**
 * The hero heading, alternative A (landing.pen ByzeA / uMQ6Y): "Less" and a rotating word on a
 * lime highlight above the stable "More photography.". Screen readers hear one stable heading.
 * @returns the heading
 */
export function RotatingHeadline() {
  const count = COPY.words.length;
  const index = useRotatingWord(count);
  const [sizer, width] = useMeasuredWidth<HTMLSpanElement>(COPY.words[index]);
  return (
    <h1 className="flex flex-col items-center gap-(--space-0-5) md:gap-(--space-1)">
      <span className="sr-only">{COPY.accessible}</span>
      <span
        aria-hidden="true"
        className="flex h-10 items-center gap-(--space-2) md:h-[76px] md:gap-(--space-4)"
      >
        <span className={cn(LINE, "font-medium")}>{COPY.prefix}</span>
        {/* Clipped at the top and sides so words slide in under the edge, but open below so
            descenders (the "y" of busywork.) hang over the highlight, as drawn. */}
        <span className="flex h-full items-center bg-(--color-semantic-accent-highlight) px-(--space-2) [clip-path:inset(0_0_-25%_0)] md:px-(--space-3)">
          <span className={cn("relative block", BOX_MOTION)} style={{ width }}>
            <span ref={sizer} className={cn(LINE, "invisible inline-block align-top font-bold")}>
              {COPY.words[index]}
            </span>
            {COPY.words.map((word, position) => (
              <span
                key={word}
                className={cn(
                  LINE,
                  "absolute top-0 left-1/2 -translate-x-1/2 font-bold",
                  WORD_MOTION,
                  wordState(position, index, count),
                )}
              >
                {word}
              </span>
            ))}
          </span>
        </span>
      </span>
      <span aria-hidden="true" className={cn(LINE, "font-bold")}>
        {COPY.stable}
      </span>
    </h1>
  );
}
