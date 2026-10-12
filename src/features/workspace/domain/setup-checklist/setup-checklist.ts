import type {
  SetupChecklist,
  SetupFacts,
  SetupStep,
  SetupStepKey,
  SetupStepState,
  SetupStepTarget,
} from "./setup-checklist.types";

/** Step order; the first step that is neither done nor locked is the current one (F-25 D-3). */
export const SETUP_STEP_ORDER: readonly SetupStepKey[] = [
  "service",
  "packageItems",
  "firstProject",
  "brandName",
];

function isDone(key: SetupStepKey, facts: Readonly<SetupFacts>): boolean {
  if (key === "service") return facts.activeServiceCount > 0;
  if (key === "packageItems") return facts.hasSelectionItem;
  if (key === "brandName") return facts.hasBrandName;
  return false;
}

function isLocked(key: SetupStepKey, facts: Readonly<SetupFacts>): boolean {
  return facts.activeServiceCount === 0 && (key === "packageItems" || key === "firstProject");
}

function targetOf(key: SetupStepKey, facts: Readonly<SetupFacts>): SetupStepTarget {
  if (key === "service") return { kind: "addService" };
  if (key === "firstProject") return { kind: "newProject" };
  if (key === "brandName") return { kind: "settings" };
  return facts.activeServiceCount === 1 && facts.soleActiveServiceId !== null
    ? { kind: "service", serviceId: facts.soleActiveServiceId }
    : { kind: "services" };
}

function stateOf(
  key: SetupStepKey,
  facts: Readonly<SetupFacts>,
  current: SetupStepKey | undefined,
): SetupStepState {
  if (isDone(key, facts)) return "done";
  if (isLocked(key, facts)) return "locked";
  return key === current ? "current" : "open";
}

/**
 * Derives the dashboard setup checklist from workspace facts; nothing is stored (F-25 D-3).
 * @param facts - what the workspace already has
 * @returns the four steps with their states and targets, or null once the workspace has a project
 */
export function deriveSetupChecklist(facts: Readonly<SetupFacts>): SetupChecklist | null {
  if (facts.hasProject) return null;
  const current = SETUP_STEP_ORDER.find((key) => !isDone(key, facts) && !isLocked(key, facts));
  const steps: SetupStep[] = SETUP_STEP_ORDER.map((key) => ({
    key,
    state: stateOf(key, facts, current),
    target: targetOf(key, facts),
  }));
  return {
    steps,
    doneCount: steps.filter((step) => step.state === "done").length,
    total: steps.length,
  };
}
