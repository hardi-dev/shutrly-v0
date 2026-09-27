import Link from "next/link";

import { Button } from "@/ui/primitives/button/button";

import { COMING_SOON_COPY } from "./coming-soon-screen.copy";
import type { ComingSoonScreenProps } from "./coming-soon-screen.types";

/** Renders a static placeholder for an unimplemented workspace section. @param props - workspace route identity @returns the coming-soon content */
export function ComingSoonScreen({ workspaceId, section }: Readonly<ComingSoonScreenProps>) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-(--space-4) text-center">
      <h1 className="text-(length:--font-size-display) font-bold">{COMING_SOON_COPY.title}</h1>
      <p className="text-(--color-semantic-text-secondary)">{section}</p>
      <Link href={`/w/${workspaceId}`}>
        <Button variant="secondary">{COMING_SOON_COPY.back}</Button>
      </Link>
    </div>
  );
}
