import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";

import {
  LANGUAGE_SWITCH_COPY,
  LANGUAGE_SWITCH_COPY_NAMESPACE,
} from "../language-switch/language-switch.copy";
import { LanguageLink } from "./language-link";

function handleNoop() {
  return undefined;
}

const withLanguageCopy: Decorator = (Story) => (
  <NextIntlClientProvider
    locale="en"
    messages={{ [LANGUAGE_SWITCH_COPY_NAMESPACE]: LANGUAGE_SWITCH_COPY.messages.en }}
  >
    <Story />
  </NextIntlClientProvider>
);

const meta = {
  title: "Patterns/Language Link",
  component: LanguageLink,
  args: { currentLocale: "en", pendingLocale: null, onSelect: handleNoop },
  decorators: [withLanguageCopy],
  parameters: { designSystemSpec: "docs/design-system/components/menu.md" },
} satisfies Meta<typeof LanguageLink>;

export default meta;

export const English: StoryObj<typeof meta> = {};
export const Indonesian: StoryObj<typeof meta> = { args: { currentLocale: "id" } };
export const Pending: StoryObj<typeof meta> = {
  args: { currentLocale: "en", pendingLocale: "id" },
};
