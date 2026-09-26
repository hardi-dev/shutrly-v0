import "../src/app/globals.css";

import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { AppProviders } from "../src/ui/providers/app-providers";
import { ThemeFrame } from "../src/ui/storybook/theme";

const withTheme: Decorator = (Story, context) => {
  const mode = context.globals.theme === "dark" ? "dark" : "light";
  return (
    <AppProviders>
      <ThemeFrame mode={mode}>
        <Story />
      </ThemeFrame>
    </AppProviders>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for the Shutrly design system",
      defaultValue: "light",
      toolbar: { icon: "paintbrush", items: ["light", "dark"] },
    },
  },
  decorators: [withTheme],
  parameters: { layout: "fullscreen" },
};

export default preview;
