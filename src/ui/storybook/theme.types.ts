import type { ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeFrameProps {
  mode: ThemeMode;
  children: ReactNode;
}
