import type { ChangeEvent } from "react";

export type TokenScalar = number | string;
export type TokenMode = "light" | "dark";

export interface TokenRecord {
  path: string;
  cssName: string;
  type: string | undefined;
  light: TokenScalar | undefined;
  dark: TokenScalar | undefined;
  alias: string | undefined;
  description: string | undefined;
}

export interface TokenExplorerProps {
  records: readonly TokenRecord[];
}

export interface TokenExplorerControlsProps {
  categories: readonly string[];
  category: string;
  onCategoryChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  search: string;
}

export interface TokenTableProps {
  records: readonly TokenRecord[];
}
