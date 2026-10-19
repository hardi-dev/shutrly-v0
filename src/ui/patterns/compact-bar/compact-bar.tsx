import Link from "next/link";
import { useTranslations } from "next-intl";

import { Icon } from "@/ui/primitives/icon/icon";

import { COMPACT_BAR_COPY_NAMESPACE } from "./compact-bar.copy";
import type {
  CompactBarFrameProps,
  CompactBarProps,
  CompactBarTitleProps,
} from "./compact-bar.types";

/** Renders the mobile sub-page back link, title, parent caption and optional actions (C33). */
export function CompactBar({ title, parent, actions }: Readonly<CompactBarProps>) {
  const t = useTranslations(COMPACT_BAR_COPY_NAMESPACE);
  return (
    <CompactBarFrame actions={actions}>
      <CompactBarTitle backLabel={t("back")} title={title} parent={parent} />
    </CompactBarFrame>
  );
}

/** The compact bar row: its children (back link and title) then the optional actions. @param props - the row content and actions @returns the row */
export function CompactBarFrame({ children, actions }: Readonly<CompactBarFrameProps>) {
  return (
    <header className="flex min-h-[52px] shrink-0 items-center gap-(--space-2) pb-(--space-2) pl-(--space-1) pr-(--space-4) pt-[calc(var(--space-2)_+_env(safe-area-inset-top))]">
      {children}
      {actions ? <div className="flex shrink-0 items-center gap-(--space-2)">{actions}</div> : null}
    </header>
  );
}

/** The back link and the title with its parent caption, shared with the server-rendered heading. @param props - the back label, title and parent @returns the link and title */
export function CompactBarTitle({ backLabel, title, parent }: Readonly<CompactBarTitleProps>) {
  return (
    <>
      <Link
        href={parent.href}
        aria-label={backLabel}
        className="flex shrink-0 items-center justify-center rounded-(--component-icon-button-radius) p-(--component-icon-button-padding) text-(--component-icon-button-icon) outline-none hover:bg-(--component-icon-button-background-hover) focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
      >
        <Icon name="chevron-left" aria-hidden="true" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-(length:--font-size-title) font-bold tracking-(--font-letter-spacing-title) text-(--color-semantic-text-primary)">
          {title}
        </h1>
        <p className="truncate text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {parent.label}
        </p>
      </div>
    </>
  );
}
