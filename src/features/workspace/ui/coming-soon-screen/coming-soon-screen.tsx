import Link from "next/link";

import { Button } from "@/ui/primitives/button/button";

import { COMING_SOON_COPY } from "./coming-soon-screen.copy";
import type { ComingSoonScreenProps } from "./coming-soon-screen.types";

/** Renders a static placeholder for an unimplemented workspace section; the shell Page Header names the section. @param props - workspace route identity @returns the coming-soon content */
export function ComingSoonScreen({ workspaceId }: Readonly<ComingSoonScreenProps>) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-(--space-4) text-center">
      <h2 className="text-(length:--font-size-title) font-bold tracking-(--font-letter-spacing-title) text-(--color-semantic-text-primary)">
        {COMING_SOON_COPY.title}
      </h2>
      <p className="text-(--color-semantic-text-secondary)">{COMING_SOON_COPY.body}</p>
      <Link href={`/w/${workspaceId}`}>
        <Button variant="secondary">{COMING_SOON_COPY.back}</Button>
      </Link>
    </div>
  );
}
