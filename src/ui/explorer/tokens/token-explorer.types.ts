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
