import { Separator } from "react-aria-components";

/** Renders a menu group separator that stays inside the menu collection (C10). */
export function MenuDivider() {
  return <Separator className="my-(--space-1) h-px border-0 bg-(--component-menu-divider)" />;
}
