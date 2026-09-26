import {
  Add01Icon,
  Alert02Icon,
  ArrowRight05Icon,
  Calendar03Icon,
  ChevronDownIcon,
  Delete02Icon,
  GoogleIcon,
  InformationCircleIcon,
  Search01Icon,
  SentIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import type { IconName } from "./icon.types";

export const ICON_NAMES: readonly IconName[] = [
  "search",
  "chevron-down",
  "calendar",
  "eye",
  "eye-off",
  "circle-alert",
  "plus",
  "send",
  "arrow-right",
  "trash-2",
  "info",
  "google",
];

export const ICON_REGISTRY: Record<IconName, IconSvgElement> = {
  search: Search01Icon,
  "chevron-down": ChevronDownIcon,
  calendar: Calendar03Icon,
  eye: ViewIcon,
  "eye-off": ViewOffIcon,
  "circle-alert": Alert02Icon,
  plus: Add01Icon,
  send: SentIcon,
  "arrow-right": ArrowRight05Icon,
  "trash-2": Delete02Icon,
  info: InformationCircleIcon,
  google: GoogleIcon,
};
