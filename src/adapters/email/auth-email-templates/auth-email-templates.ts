import "server-only";

import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { AUTH_EMAIL_COPY } from "./auth-email-templates.copy";
import type { RenderedEmail } from "./auth-email-templates.types";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Render the verification or reset email as plain text and minimal HTML. The name and URL are
 * escaped in HTML; the copy lives in `auth-email-templates.copy.ts`.
 * @param link - the link kind, recipient name and URL
 * @returns the subject, text body and HTML body
 */
export function renderAuthEmail(link: AuthLink): RenderedEmail {
  const copy = AUTH_EMAIL_COPY[link.kind];
  const greeting = `${AUTH_EMAIL_COPY.greeting} ${link.name},`;
  const text = [greeting, "", copy.intro, link.url, "", copy.expiry, copy.ignore].join("\n");
  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${copy.intro}</p>`,
    `<p><a href="${escapeHtml(link.url)}">${copy.action}</a></p>`,
    `<p>${copy.expiry}</p>`,
    `<p>${copy.ignore}</p>`,
  ].join("");
  return { subject: copy.subject, text, html };
}
