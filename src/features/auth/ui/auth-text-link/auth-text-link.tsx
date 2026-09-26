import Link from "next/link";

import type { AuthTextLinkProps } from "./auth-text-link.types";

/**
 * An inline auth link (body-sm, semibold, `status.info.fg`) with a visible focus ring.
 * @param props - the target and the link text
 * @returns the link
 */
export function AuthTextLink({ href, children }: Readonly<AuthTextLinkProps>) {
  return (
    <Link
      href={href}
      className="rounded-(--radius-xs) text-(length:--font-size-body-sm) font-semibold text-(--color-semantic-status-info-fg) underline-offset-2 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-semantic-focus-ring)"
    >
      {children}
    </Link>
  );
}
