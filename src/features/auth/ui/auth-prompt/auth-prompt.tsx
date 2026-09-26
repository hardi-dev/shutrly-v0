import { AuthTextLink } from "../auth-text-link/auth-text-link";
import type { AuthPromptProps } from "./auth-prompt.types";

/**
 * The centred "question + link" line under a form, e.g. switching between sign-in and sign-up.
 * @param props - the translated prompt, the link target and the link text
 * @returns the prompt line
 */
export function AuthPrompt({ prompt, href, link }: Readonly<AuthPromptProps>) {
  return (
    <p className="flex justify-center gap-(--space-1) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
      <span>{prompt}</span>
      <AuthTextLink href={href}>{link}</AuthTextLink>
    </p>
  );
}
