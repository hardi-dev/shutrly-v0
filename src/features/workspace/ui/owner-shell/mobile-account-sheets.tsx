"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AppLocale } from "@/shared/locale/locale.types";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { useLanguageSwitch } from "@/ui/patterns/language-switch/use-language-switch";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";

import type { OwnerLocaleAction } from "../account-menu/account-menu.types";
import {
  LANGUAGE_OPTIONS,
  languageLabelKey,
  ownerLanguageSwitchAction,
  useOwnerLocale,
} from "../account-menu/owner-locale";
import { useOwnerNavTranslations } from "../owner-nav/owner-nav";
import {
  MOBILE_ACCOUNT_LANGUAGE_NAMESPACE,
  MOBILE_ACCOUNT_OWNER_NAMESPACE,
} from "./mobile-account-sheets.copy";
import type { MobileAccountSheet } from "./mobile-account-sheets.types";

/**
 * Tracks which account sub-sheet is open. Opening one closes the menu first; the sub-sheet is a
 * sibling of the menu, so it stays open after the menu closes.
 * @param onMenuOpenChange - closes the mobile menu
 * @returns the open sub-sheet, an opener and the close handler
 */
export function useMobileAccountSheets(onMenuOpenChange: (isOpen: boolean) => void) {
  const [subSheet, setSubSheet] = useState<MobileAccountSheet | null>(null);
  const openSheet = (sheet: MobileAccountSheet) => {
    onMenuOpenChange(false);
    setSubSheet(sheet);
  };
  const closeSubSheet = (isOpen: boolean) => {
    if (!isOpen) setSubSheet(null);
  };
  return { subSheet, openSheet, closeSubSheet };
}

/** Renders the language and theme sub-sheets; only the open one is shown. */
export function MobileAccountSheets({
  subSheet,
  onChange,
  action,
}: Readonly<{
  subSheet: MobileAccountSheet | null;
  onChange: (isOpen: boolean) => void;
  action?: OwnerLocaleAction;
}>) {
  return (
    <>
      {action ? (
        <MobileLanguageSheet
          isOpen={subSheet === "language"}
          onOpenChange={onChange}
          action={action}
        />
      ) : null}
      <MobileThemeSheet isOpen={subSheet === "theme"} onOpenChange={onChange} />
    </>
  );
}

/** The Account rows of the mobile menu; language and theme open their own sheets (AC-L10N-001). */
export function MobileAccountGroup({
  hasLanguage,
  onProfile,
  onOpenSheet,
  onNavigateSettings,
  onLogout,
}: Readonly<{
  hasLanguage: boolean;
  onProfile: () => void;
  onOpenSheet: (sheet: MobileAccountSheet) => void;
  onNavigateSettings: () => void;
  onLogout?: () => void;
}>) {
  const t = useTranslations(MOBILE_ACCOUNT_OWNER_NAMESPACE);
  const navT = useOwnerNavTranslations();
  const languageT = useTranslations(MOBILE_ACCOUNT_LANGUAGE_NAMESPACE);
  const currentLocale = useOwnerLocale();
  const handleLanguage = () => {
    onOpenSheet("language");
  };
  const handleTheme = () => {
    onOpenSheet("theme");
  };
  return (
    <>
      <SheetItem label={t("profile")} icon="user" onPress={onProfile} />
      <SheetItem label={navT("settings")} icon="settings" onPress={onNavigateSettings} />
      {hasLanguage ? (
        <SheetItem
          label={languageT("accessibleName")}
          icon="languages"
          value={languageT(languageLabelKey(currentLocale))}
          onPress={handleLanguage}
        />
      ) : null}
      <SheetItem
        label={t("theme")}
        icon="sun-moon"
        value={t("themeSystem")}
        onPress={handleTheme}
      />
      {onLogout ? (
        <SheetItem label={t("logout")} icon="log-out" variant="destructive" onPress={onLogout} />
      ) : null}
    </>
  );
}

/** The language choices as a sheet; the chosen one spins while the owner's locale is saved. */
export function MobileLanguageSheet({
  isOpen,
  onOpenChange,
  action,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  action: OwnerLocaleAction;
}>) {
  const currentLocale = useOwnerLocale();
  const t = useTranslations(MOBILE_ACCOUNT_LANGUAGE_NAMESPACE);
  const { pendingLocale, selectLocale } = useLanguageSwitch(
    currentLocale,
    ownerLanguageSwitchAction(action),
  );
  const isPending = pendingLocale !== null;
  const chooseLocale = (locale: AppLocale) => () => {
    void selectLocale(locale).finally(() => {
      onOpenChange(false);
    });
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t("accessibleName")}
      meta={isPending ? t("changing") : undefined}
      variant="menu"
    >
      {LANGUAGE_OPTIONS.map(({ locale, labelKey }) => (
        <SheetItem
          key={locale}
          label={t(labelKey)}
          isSelected={locale === currentLocale}
          isDisabled={isPending}
          isPending={pendingLocale === locale}
          onPress={chooseLocale(locale)}
        />
      ))}
    </BottomSheet>
  );
}

/** Theme choices are shown with no action; theme switching is the next phase. */
export function MobileThemeSheet({
  isOpen,
  onOpenChange,
}: Readonly<{ isOpen: boolean; onOpenChange: (isOpen: boolean) => void }>) {
  const t = useTranslations(MOBILE_ACCOUNT_OWNER_NAMESPACE);
  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange} title={t("theme")} variant="menu">
      <SheetItem label={t("themeLight")} icon="sun" />
      <SheetItem label={t("themeDark")} icon="moon" />
      <SheetItem label={t("themeSystem")} icon="monitor" isSelected />
    </BottomSheet>
  );
}
