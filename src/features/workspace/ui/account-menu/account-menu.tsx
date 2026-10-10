"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

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
import { LANGUAGE_OPTIONS, ownerLanguageSwitchAction, useOwnerLocale } from "./owner-locale";

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
          <MenuItem label={t("profile")} icon="user" href="/profile" />
          <MenuItem label={navT("settings")} icon="settings" href={`/w/${workspaceId}/settings`} />
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
  const currentLocale = useOwnerLocale();
  const t = useTranslations(ACCOUNT_MENU_LANGUAGE_NAMESPACE);
  const save = ownerLanguageSwitchAction(action);
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
            isPending={isChosen}
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
      <MenuItem label={t("themeLight")} icon="sun" shouldCloseOnSelect={false} />
      <MenuItem label={t("themeDark")} icon="moon" shouldCloseOnSelect={false} />
      <MenuItem label={t("themeSystem")} icon="monitor" isSelected shouldCloseOnSelect={false} />
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
