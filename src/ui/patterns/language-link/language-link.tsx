"use client";

import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { Button as AriaButton } from "react-aria-components";

import type { AppLocale } from "@/shared/locale/locale.types";
import { cn } from "@/ui/cn/cn";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Icon } from "@/ui/primitives/icon/icon";

import { LANGUAGE_LINK_COPY_NAMESPACE } from "./language-link.copy";
import type {
  LanguageLinkCopy,
  LanguageLinkProps,
  LanguageTriggerProps,
  OptionLocale,
} from "./language-link.types";

const LG_VIEWPORT_QUERY = "(min-width: 1024px)";

const OPTIONS: readonly OptionLocale[] = [
  { locale: "en", labelKey: "english" },
  { locale: "id", labelKey: "indonesian" },
];

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const mediaQuery = window.matchMedia(LG_VIEWPORT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getSnapshot(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(LG_VIEWPORT_QUERY).matches;
}

/** True from the `lg` breakpoint (1024 px) up; the server renders the sheet layout. */
function useLgViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function useLanguageLinkCopy(): LanguageLinkCopy {
  const t = useTranslations(LANGUAGE_LINK_COPY_NAMESPACE);
  return {
    name: t("accessibleName"),
    english: t("english"),
    indonesian: t("indonesian"),
    changing: t("changing"),
  };
}

function triggerClassName(isPending: boolean): string {
  return cn(
    "group inline-flex items-center gap-(--space-1-5) outline-none",
    isPending
      ? "cursor-default text-(--color-semantic-text-muted)"
      : "text-(--color-semantic-text-secondary) data-hovered:text-(--color-semantic-status-info-fg) data-focus-visible:text-(--color-semantic-status-info-fg)",
  );
}

function selfName(locale: AppLocale, copy: LanguageLinkCopy): string {
  return locale === "en" ? copy.english : copy.indonesian;
}

/** The text-only trigger: the current self-name, or the pending line while a switch saves. */
function LanguageTrigger({
  "aria-label": ariaLabel,
  currentLocale,
  pendingLocale,
  copy,
  onPress,
}: Readonly<LanguageTriggerProps>) {
  const isPending = pendingLocale !== null;
  return (
    <AriaButton
      aria-label={ariaLabel}
      isDisabled={isPending}
      onPress={onPress}
      className={triggerClassName(isPending)}
    >
      <Icon
        name={isPending ? "loading-03" : "globe"}
        aria-hidden="true"
        className={isPending ? "animate-spin" : undefined}
      />
      <span
        className={cn(
          "whitespace-nowrap text-(length:--font-size-body-sm) font-medium",
          !isPending && "group-data-hovered:underline group-data-focus-visible:underline",
        )}
      >
        {isPending ? copy.changing : selfName(currentLocale, copy)}
      </span>
    </AriaButton>
  );
}

function DesktopOption({
  option,
  copy,
  currentLocale,
  onSelect,
}: Readonly<{
  option: OptionLocale;
  copy: LanguageLinkCopy;
  currentLocale: AppLocale;
  onSelect: (locale: AppLocale) => void;
}>) {
  const handleSelect = () => {
    onSelect(option.locale);
  };
  return (
    <MenuItem
      label={copy[option.labelKey]}
      isSelected={option.locale === currentLocale}
      onSelect={handleSelect}
    />
  );
}

/** The `lg` and up menu: English and Bahasa Indonesia, the current one checked. */
function DesktopLanguageMenu({
  currentLocale,
  pendingLocale,
  copy,
  onSelect,
}: Readonly<LanguageLinkProps & { copy: LanguageLinkCopy }>) {
  return (
    <MenuTrigger label={copy.name}>
      <LanguageTrigger currentLocale={currentLocale} pendingLocale={pendingLocale} copy={copy} />
      <Menu aria-label={copy.name}>
        {OPTIONS.map((option) => (
          <DesktopOption
            key={option.locale}
            option={option}
            copy={copy}
            currentLocale={currentLocale}
            onSelect={onSelect}
          />
        ))}
      </Menu>
    </MenuTrigger>
  );
}

function SheetOption({
  option,
  copy,
  currentLocale,
  onChoose,
}: Readonly<{
  option: OptionLocale;
  copy: LanguageLinkCopy;
  currentLocale: AppLocale;
  onChoose: (locale: AppLocale) => void;
}>) {
  const handleChoose = () => {
    onChoose(option.locale);
  };
  return (
    <SheetItem
      label={copy[option.labelKey]}
      isSelected={option.locale === currentLocale}
      onPress={handleChoose}
    />
  );
}

/** Below `lg`: a Bottom Sheet titled with the accessible name, one SheetItem per language. */
function MobileLanguageLink({
  currentLocale,
  pendingLocale,
  onSelect,
  copy,
}: Readonly<LanguageLinkProps & { copy: LanguageLinkCopy }>) {
  const [isOpen, setIsOpen] = useState(false);
  const openSheet = () => {
    setIsOpen(true);
  };
  const choose = (locale: AppLocale) => {
    setIsOpen(false);
    onSelect(locale);
  };
  return (
    <>
      <LanguageTrigger
        aria-label={copy.name}
        currentLocale={currentLocale}
        pendingLocale={pendingLocale}
        copy={copy}
        onPress={openSheet}
      />
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={copy.name} variant="actions">
        {OPTIONS.map((option) => (
          <SheetOption
            key={option.locale}
            option={option}
            copy={copy}
            currentLocale={currentLocale}
            onChoose={choose}
          />
        ))}
      </BottomSheet>
    </>
  );
}

/**
 * Renders the auth header's text-only language link: a Menu at `lg` and up, a Bottom Sheet below.
 * @param props - the displayed locale, the locale being saved, and the choose handler
 * @returns the link with its menu or sheet
 */
export function LanguageLink({
  currentLocale,
  pendingLocale,
  onSelect,
}: Readonly<LanguageLinkProps>) {
  const copy = useLanguageLinkCopy();
  const isLg = useLgViewport();
  const Layout = isLg ? DesktopLanguageMenu : MobileLanguageLink;
  return (
    <Layout
      currentLocale={currentLocale}
      pendingLocale={pendingLocale}
      copy={copy}
      onSelect={onSelect}
    />
  );
}
