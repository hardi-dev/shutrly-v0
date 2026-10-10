"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { DEFAULT_LOCALE, parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";
import { useLanguageSwitch } from "@/ui/patterns/language-switch/use-language-switch";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuGroupLabel } from "@/ui/patterns/menu/menu-group-label";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuSection } from "@/ui/patterns/menu/menu-section";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";

import { useOwnerNavTranslations } from "../owner-nav/owner-nav";
import { ACCOUNT_MENU_COPY_NAMESPACE, ACCOUNT_MENU_LANGUAGE_NAMESPACE } from "./account-menu.copy";
import type { AccountMenuProps, OwnerLocaleAction } from "./account-menu.types";

const LANGUAGE_OPTIONS = [
  { locale: "en", labelKey: "english" },
  { locale: "id", labelKey: "indonesian" },
] as const satisfies readonly { locale: AppLocale; labelKey: string }[];

/** The desktop account menu: profile and settings, language, theme and sign out (AC-L10N-001). */
export function AccountMenu({
  workspaceId,
  localeAction,
  onLogout,
  children,
}: Readonly<AccountMenuProps>) {
  const t = useTranslations(ACCOUNT_MENU_COPY_NAMESPACE);
  const navT = useOwnerNavTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <MenuTrigger label={t("accountMenu")} isOpen={isOpen} onOpenChange={setIsOpen}>
      {children}
      <Menu aria-label={t("accountMenu")}>
        <MenuSection>
          <MenuItem label={t("profile")} href="/profile" />
          <MenuItem label={navT("settings")} href={`/w/${workspaceId}/settings`} />
        </MenuSection>
        <MenuDivider />
        {localeAction ? <LanguageGroup action={localeAction} onSettled={closeMenu} /> : null}
        <MenuDivider />
        <ThemeGroup />
        {onLogout ? <SignOutRow onLogout={onLogout} /> : null}
      </Menu>
    </MenuTrigger>
  );
}

function LanguageGroup({
  action,
  onSettled,
}: Readonly<{ action: OwnerLocaleAction; onSettled: () => void }>) {
  const currentLocale = parseAppLocale(useLocale()) ?? DEFAULT_LOCALE;
  const t = useTranslations(ACCOUNT_MENU_LANGUAGE_NAMESPACE);
  const save = async (locale: AppLocale) => (await action({ locale })) === undefined;
  const { pendingLocale, selectLocale } = useLanguageSwitch(currentLocale, save);
  const isPending = pendingLocale !== null;
  const chooseLocale = (locale: AppLocale) => () => {
    void selectLocale(locale).finally(onSettled);
  };

  return (
    <MenuSection>
      <MenuGroupLabel>{t("accessibleName")}</MenuGroupLabel>
      {LANGUAGE_OPTIONS.map(({ locale, labelKey }) => {
        const isChosen = pendingLocale === locale;
        return (
          <MenuItem
            key={locale}
            label={t(labelKey)}
            description={isChosen ? t("changing") : undefined}
            icon={isChosen ? "loading-03" : undefined}
            isSelected={locale === currentLocale}
            isDisabled={isPending}
            shouldCloseOnSelect={false}
            onSelect={chooseLocale(locale)}
          />
        );
      })}
    </MenuSection>
  );
}

/** Theme choices are shown with no action; theme switching is the next phase. */
function ThemeGroup() {
  const t = useTranslations(ACCOUNT_MENU_COPY_NAMESPACE);
  return (
    <MenuSection>
      <MenuGroupLabel>{t("theme")}</MenuGroupLabel>
      <MenuItem label={t("themeLight")} shouldCloseOnSelect={false} />
      <MenuItem label={t("themeDark")} shouldCloseOnSelect={false} />
      <MenuItem label={t("themeSystem")} isSelected shouldCloseOnSelect={false} />
    </MenuSection>
  );
}

function SignOutRow({ onLogout }: Readonly<{ onLogout: () => void }>) {
  const t = useTranslations(ACCOUNT_MENU_COPY_NAMESPACE);
  return (
    <>
      <MenuDivider />
      <MenuItem label={t("logout")} icon="log-out" variant="destructive" onSelect={onLogout} />
    </>
  );
}
