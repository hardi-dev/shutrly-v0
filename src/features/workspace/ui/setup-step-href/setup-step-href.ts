import type { SetupStepTarget } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

/**
 * Turns a setup step's target into the owner URL that does the step (F-25 D-4).
 * @param workspaceId - the verified workspace in the URL
 * @param target - the step target from the domain
 * @returns the href
 */
export function setupStepHref(workspaceId: string, target: SetupStepTarget): string {
  const base = `/w/${workspaceId}`;
  switch (target.kind) {
    case "addService":
      return `${base}/services?add=service`;
    case "service":
      return `${base}/services/${target.serviceId}`;
    case "services":
      return `${base}/services`;
    case "newProject":
      return `${base}/projects/new`;
    case "settings":
      return `${base}/settings`;
  }
}
