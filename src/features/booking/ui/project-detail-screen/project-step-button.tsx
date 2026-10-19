"use client";

import { useTranslations } from "next-intl";

import type { ManualStep } from "@/features/booking/domain/project-status/project-status.types";
import { Button } from "@/ui/primitives/button/button";

import { projectStepCopy } from "../project-step-copy/project-step-copy";
import { PROJECT_DETAIL_SCREEN_COPY_NAMESPACE } from "./project-detail-screen.copy";

/** The one forward step for the project's status; pending shows the Loading label (AC-PRJ-020). */
export function ProjectStepButton({
  step,
  isPending,
  isDisabled,
  size,
  className,
  onAdvance,
}: Readonly<{
  step: ManualStep;
  isPending: boolean;
  isDisabled: boolean;
  size: "md" | "lg";
  className?: string;
  onAdvance: (step: ManualStep) => Promise<void>;
}>) {
  const t = useTranslations(PROJECT_DETAIL_SCREEN_COPY_NAMESPACE);
  const copy = projectStepCopy(t, step);
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
