import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { PROVIDER_COPY } from "../source-copy/source-copy.copy";
import type { PhotoSourcesScreenProps } from "./photo-sources-screen.types";

export function PhotoSourcesScreen({ sources }: PhotoSourcesScreenProps) {
  return (
    <main
      id="photo-sources-content"
      className="mx-auto flex w-full max-w-[720px] flex-col gap-(--space-6)"
    >
      <section className="rounded-(--component-section-card-radius) bg-(--component-section-card-background) p-(--space-6)">
        <div className="flex items-start justify-between gap-(--space-4)">
          <div>
            <h2 className="text-(length:--font-size-heading-sm) font-semibold">
              {SOURCE_COPY.listTitle}
            </h2>
            <p className="mt-(--space-1) text-(--color-semantic-text-secondary)">
              {SOURCE_COPY.listDescription}
            </p>
          </div>
          <button type="button">{SOURCE_COPY.add}</button>
        </div>
        <ul className="mt-(--space-5) divide-y divide-(--color-semantic-border-subtle)">
          {sources.map((source) => (
            <li key={source.id} className="flex items-center justify-between py-(--space-4)">
              <div>
                <p className="font-medium">{source.displayName}</p>
                <p className="text-(--color-semantic-text-secondary)">
                  {PROVIDER_COPY[source.provider].title}
                </p>
              </div>
              <span>{source.isActive ? SOURCE_COPY.active : SOURCE_COPY.inactive}</span>
            </li>
          ))}
          {sources.length === 0 ? (
            <li className="py-(--space-8) text-center">
              <p className="font-medium">{SOURCE_COPY.emptyTitle}</p>
              <p className="mt-(--space-1) text-(--color-semantic-text-secondary)">
                {SOURCE_COPY.emptyBody}
              </p>
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
