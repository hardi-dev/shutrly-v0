import type { AppLocale } from "@/shared/locale/locale.types";

import { PRIVACY_POLICY_COPY } from "./privacy-policy.copy";

/**
 * The privacy policy text in the requested language, plain and readable on a phone.
 * @param props - the active language
 * @returns the policy as one article
 */
export function PrivacyPolicy({ locale }: Readonly<{ locale: AppLocale }>) {
  const copy = PRIVACY_POLICY_COPY[locale];
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">{copy.title}</h1>
      <p>{copy.intro}</p>
      {copy.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.items ? (
            <ul className="list-disc pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      <p>
        <a href={`mailto:${copy.contactEmail}`}>{copy.contactEmail}</a>
      </p>
    </article>
  );
}
