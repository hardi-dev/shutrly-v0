import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import tokens from "../../../../docs/design-system/tokens.json";
import { flattenTokens } from "./token-data";
import { TokenExplorer } from "./token-explorer";

const meta = {
  title: "Design System/Tokens",
  component: TokenExplorer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TokenExplorer>;

export default meta;

export const AllTokens: StoryObj<typeof meta> = {
  args: { records: flattenTokens(tokens) },
};
