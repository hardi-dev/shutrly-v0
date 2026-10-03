"use client";

import type { ProjectStep } from "@/features/booking/domain/project-status/project-status.types";
import { Button } from "@/ui/primitives/button/button";

import { projectStepCopy } from "../project-step-copy/project-step-copy";

/** The one forward step for the project's status; pending shows the Loading label (AC-PRJ-020). */
export function ProjectStepButton({
  step,
  isPending,
  isDisabled,
  size,
  className,
  onAdvance,
}: Readonly<{
  step: ProjectStep;
  isPending: boolean;
  isDisabled: boolean;
  size: "md" | "lg";
  className?: string;
  onAdvance: (step: ProjectStep) => Promise<void>;
}>) {
  const copy = projectStepCopy(step);
  const handlePress = () => {
    void onAdvance(step);
  };
  return (
    <Button
      size={size}
      className={className}
      iconLeading={copy.icon}
      isPending={isPending}
      isDisabled={isDisabled}
      onPress={handlePress}
    >
      {isPending ? copy.pendingLabel : copy.label}
    </Button>
  );
}
