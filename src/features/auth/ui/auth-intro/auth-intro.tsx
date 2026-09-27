import type { AuthIntroProps } from "./auth-intro.types";

/**
 * A screen's heading and lead paragraph (auth.pen intro group, gap `space.2`).
 * @param props - the translated title and lead
 * @returns the intro block
 */
export function AuthIntro({ title, lead }: Readonly<AuthIntroProps>) {
  return (
    <div className="flex flex-col gap-(--space-2)">
      <h1 className="text-(length:--font-size-display) leading-tight font-bold text-(--color-semantic-text-primary)">
        {title}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {lead}
      </p>
    </div>
  );
}
