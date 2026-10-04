import "server-only";

export interface PasswordHasherPort {
  readonly hash: (password: string) => Promise<string>;
  readonly verify: (hash: string, password: string) => Promise<boolean>;
}
